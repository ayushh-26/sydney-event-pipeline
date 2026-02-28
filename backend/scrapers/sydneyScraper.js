const puppeteer = require("puppeteer");
const { runPipeline } = require("./engine");

// Prevents double-execution
let isScraping = false;

const scrapeSydneyEvents = async () => {
  if (isScraping) {
    console.log("⚠️ Scrape already in progress. Skipping duplicate call.");
    return;
  }
  
  isScraping = true;
  console.log("\n🚀 Starting Multi-Source Event Interceptor...");
  console.log("------------------------------------------");

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1000 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    );

    let allEvents = [];
    const seenTitles = new Set();

    // =====================================
    // GLOBAL API INTERCEPTOR
    // =====================================
    page.on("response", async (response) => {
      const resourceType = response.request().resourceType();
      if (resourceType === "fetch" || resourceType === "xhr") {
        try {
          const json = await response.json();
          
          // ----------------------------------------
          // LOGIC A: EVENTBRITE (Your exact working code)
          // ----------------------------------------
          let eventArray = null;
          if (json?.events && Array.isArray(json.events)) {
            eventArray = json.events;
          } else if (json?.events?.results && Array.isArray(json.events.results)) {
            eventArray = json.events.results;
          } else if (json?.results && Array.isArray(json.results)) {
            eventArray = json.results;
          }

          if (eventArray) {
            eventArray.forEach((event) => {
              if (event.privacy_setting && event.privacy_setting !== "unlocked") return;
              if (event.status && event.status !== "live") return;
              
              const now = new Date();
              const salesEnd = new Date(event.event_sales_status?.end_sales_date?.utc);
              if (salesEnd < now || (salesEnd - now) < 3600000) return;

              if (!seenTitles.has(event.name)) {
                seenTitles.add(event.name);

                let highResImage = event.image?.original?.url || event.image?.url;
                let venueName = event.primary_venue?.name || "Sydney, AU";
                if (event.primary_venue?.address?.localized_area_display) {
                  venueName += `, ${event.primary_venue.address.localized_area_display}`;
                }

                let eventDate = new Date().toISOString();
                try {
                  const timeStr = event.start_time || "00:00";
                  eventDate = new Date(`${event.start_date}T${timeStr}:00`).toISOString();
                } catch (e) {}

                const eventId = event.id || event.eventbrite_event_id;
                const cleanSafeUrl = `https://www.eventbrite.com/e/${eventId}`;

                allEvents.push({
                  title: event.name,
                  date: eventDate,
                  venue: venueName,
                  description: event.summary || "No description provided.",
                  imageUrl: highResImage || `https://picsum.photos/seed/${eventId}/400/300`,
                  originalUrl: cleanSafeUrl,
                  sourceName: "Eventbrite",
                  city: "Sydney"
                });
              }
            });
          }

          // ----------------------------------------
          // LOGIC B: SYDNEY.COM
          // ----------------------------------------
          if (json?.hits?.hits && Array.isArray(json.hits.hits)) {
            json.hits.hits.forEach((item) => {
              const src = item._source;
              const title = src.title?.[0];
              
              if (title && !seenTitles.has(title)) {
                seenTitles.add(title);
                
                allEvents.push({
                  title: title,
                  date: src.event_date_range?.[0]?.gte || new Date().toISOString(),
                  venue: src.owning_organisation_name?.[0] || "Sydney, AU",
                  description: src.product_summary?.[0] || src.product_description?.[0] || "No description provided.",
                  imageUrl: src.image?.[0]?.path || `https://picsum.photos/seed/${item._id}/400/300`,
                  originalUrl: src.url?.[0] || "https://www.sydney.com/events",
                  sourceName: "City of Sydney",
                  city: "Sydney"
                });
              }
            });
          }
        } catch (err) {}
      }
    });

    // =====================================
    // SCRAPE SOURCE 1: EVENTBRITE
    // =====================================
    console.log("🌐 Navigating to Eventbrite...");
    await page.goto("https://www.eventbrite.com.au/d/australia--sydney/all-events/", { waitUntil: "networkidle2", timeout: 60000 });

    const pagesToScrape = 4;

    for (let i = 1; i <= pagesToScrape; i++) {
      console.log(`📜 Processing Eventbrite Page ${i}/${pagesToScrape}...`);
      await autoScroll(page);
      await new Promise((r) => setTimeout(r, 2000));
      
      // Clean UI: Log total here instead of inside the async interceptor
      console.log(`   ✅ Captured! Total events in queue: ${allEvents.length}`);

      if (i < pagesToScrape) {
        const clickedNext = await page.evaluate(() => {
          const allElements = Array.from(document.querySelectorAll("*"));
          const paginationText = allElements.find(
            (el) => el.innerText && el.innerText.match(/^\d+\s+of\s+\d+$/) && el.children.length === 0
          );
          if (paginationText?.parentElement?.parentElement) {
            const wrapper = paginationText.parentElement.parentElement;
            const buttons = wrapper.querySelectorAll("button, a");
            const nextBtn = buttons[buttons.length - 1];
            if (nextBtn && !nextBtn.disabled) {
              nextBtn.click();
              return true;
            }
          }
          const selectors = ['button[aria-label*="Next"]', 'button[data-testid*="next"]'];
          for (let sel of selectors) {
            const btn = document.querySelector(sel);
            if (btn && !btn.disabled) {
              btn.click();
              return true;
            }
          }
          return false;
        });

        if (clickedNext) {
          await new Promise((r) => setTimeout(r, 4500));
        } else {
          console.log("⚠️ Next button not found.");
          break;
        }
      }
    }

    // =====================================
    // SCRAPE SOURCE 2: SYDNEY.COM
    // =====================================
    console.log("------------------------------------------");
    console.log("🌐 Navigating to Sydney.com...");
    let eventCountBeforeSydney = allEvents.length;
    
    await page.goto("https://www.sydney.com/events", { waitUntil: "networkidle2", timeout: 60000 });
    
    // Just wait 4 seconds for the initial JSON payload to flow in (no clicking pages)
    await new Promise((r) => setTimeout(r, 4000)); 
    
    let sydneyCaught = allEvents.length - eventCountBeforeSydney;
    console.log(`   ✅ Captured! Added ${sydneyCaught} events from Sydney.com.`);

    // =====================================
    // FINALIZE PIPELINE
    // =====================================
    console.log("------------------------------------------");
    console.log(`✅ Success: Total unique events extracted: ${allEvents.length}`);

    if (allEvents.length > 0) {
      console.log(`🔄 Transferring to MongoDB Pipeline...`);
      await runPipeline(allEvents);
    }
  } catch (error) {
    console.error("❌ Scraper Error:", error.message);
  } finally {
    await browser.close();
    isScraping = false;
  }
};

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      let distance = 600;
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 600);
    });
  });
}

module.exports = { scrapeSydneyEvents };