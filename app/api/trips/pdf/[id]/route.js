import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { auth } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    // Authenticate user via Clerk
    const { userId } = await auth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get trip data from request body
    const tripData = await request.json();

    if (!tripData) {
      return NextResponse.json({ error: 'No trip data provided' }, { status: 400 });
    }

    // Generate HTML content (your existing HTML + CSS styling here)
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>${tripData.location || 'Your Trip Itinerary'}</title>
          <style>
              /* Your full CSS styles here */
              @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
              /* ... rest of CSS omitted for brevity ... */
              body { 
                font-family: 'Poppins', sans-serif; 
                margin: 0; 
                padding: 0; 
                background-color: #ffffff; 
                color: #1f2937; 
                -webkit-print-color-adjust: exact;
                line-height: 1.6;
              }
              /* Add the rest of your CSS from your original code */
          </style>
      </head>
      <body>
          <div class="page">
              <!-- Header -->
              <div class="header">
                  <h1>🧳 Travel Plan</h1>
                  <h2>${tripData.location || 'Your Destination'}</h2>
              </div>

              <!-- Trip Overview -->
              <div class="trip-overview">
                  <h3>📋 Trip Overview</h3>
                  <div>
                      <strong>Location:</strong> ${tripData.location || 'N/A'}<br />
                      <strong>Duration:</strong> ${tripData.duration || 'N/A'}<br />
                      <strong>Budget:</strong> ${tripData.budget || 'N/A'}<br />
                      <strong>Travelers:</strong> ${tripData.travelers || 'N/A'}<br />
                      ${tripData.bestTimeToVisit ? `<strong>Best Time to Visit:</strong> ${tripData.bestTimeToVisit}<br />` : ''}
                  </div>
              </div>

              <!-- Hotels Section -->
              ${tripData.hotels && tripData.hotels.length > 0 ? `
              <h3>🏨 Recommended Hotels</h3>
              <div>
                  ${tripData.hotels.map(hotel => `
                      <div>
                          <h4>${hotel.hotelName || hotel.name || 'Hotel'}</h4>
                          ${hotel.hotelAddress || hotel.address ? `<p>Address: ${hotel.hotelAddress || hotel.address}</p>` : ''}
                          ${hotel.price ? `<p>Price: ₹${hotel.price}</p>` : ''}
                          ${hotel.rating ? `<p>Rating: ${hotel.rating}</p>` : ''}
                          ${hotel.descriptions || hotel.description ? `<p>${hotel.descriptions || hotel.description}</p>` : ''}
                      </div>
                  `).join('')}
              </div>` : ''}

              <!-- Itinerary -->
              ${tripData.suggestedItinerary && tripData.suggestedItinerary.length > 0 ? `
                  ${tripData.suggestedItinerary.map((day, i) => `
                      <div>
                          <h3>Day ${i + 1}: ${day.theme || `Day ${i + 1}`}</h3>
                          ${day.plan && day.plan.length > 0 ? `
                              <ul>
                              ${day.plan.map((activity, idx) => `
                                  <li>
                                    <strong>${idx + 1}. ${activity.placeName || activity.name || 'Activity'}</strong><br />
                                    ${activity.rating ? `Rating: ${activity.rating}<br />` : ''}
                                    ${activity.timeTravelEachLocation ? `Duration: ${activity.timeTravelEachLocation}<br />` : ''}
                                    ${activity.placeDetails || activity.description ? `<p>${activity.placeDetails || activity.description}</p>` : ''}
                                  </li>
                              `).join('')}
                              </ul>
                          ` : `<p>No activities planned for this day</p>`}
                      </div>
                  `).join('')}
              ` : ''}

              <!-- Disclaimer and Footer -->
              ${tripData.disclaimer ? `
                <div>
                  <h3>⚠️ Important Notice</h3>
                  <p>${tripData.disclaimer}</p>
                </div>
              ` : ''}
              <footer>
                  <p>Travel plan generated on ${new Date().toLocaleDateString()}</p>
                  <p>Have a wonderful trip! ✈️🌟</p>
              </footer>
          </div>
      </body>
      </html>
    `;

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.5cm', bottom: '0.5cm', left: '0.5cm', right: '0.5cm' },
    });

    await browser.close();

    const filename = `${(tripData.location || 'travel-plan').replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF', details: error.message }, { status: 500 });
  }
}
