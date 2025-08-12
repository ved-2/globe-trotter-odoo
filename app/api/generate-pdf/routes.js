
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { auth } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    console.log('=== PDF API Called ===');
    
    // Authenticate user via Clerk
    const { userId } = await auth(request);
    console.log('User ID:', userId);
    
    if (!userId) {
      console.log('❌ Unauthorized - no user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get trip data from request body
    let tripData;
    try {
      tripData = await request.json();
      console.log('📊 Received trip data:', JSON.stringify(tripData, null, 2));
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON data' }, { status: 400 });
    }

    if (!tripData) {
      console.log('❌ No trip data provided');
      return NextResponse.json({ error: 'No trip data provided' }, { status: 400 });
    }

    // Generate HTML content with improved styling
    const locationName = tripData.location || tripData.destination?.name || 'Your Destination';
    console.log('📍 Using location name:', locationName);

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>${locationName} - Trip Itinerary</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
              
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body { 
                font-family: 'Poppins', sans-serif; 
                background-color: #ffffff; 
                color: #1f2937; 
                -webkit-print-color-adjust: exact;
                line-height: 1.6;
                font-size: 14px;
              }
              
              .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 3px solid #4f46e5;
                padding-bottom: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 20px;
                border-radius: 12px;
                margin-bottom: 30px;
              }
              
              .header h1 {
                font-size: 2.5rem;
                margin: 0;
                font-weight: 700;
              }
              
              .header h2 {
                font-size: 1.8rem;
                margin: 10px 0 0 0;
                font-weight: 500;
                opacity: 0.9;
              }
              
              .trip-overview {
                background: #f8fafc;
                padding: 25px;
                border-radius: 12px;
                margin-bottom: 30px;
                border-left: 5px solid #4f46e5;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              
              .trip-overview h3 {
                color: #1f2937;
                margin-bottom: 15px;
                font-size: 1.3rem;
                font-weight: 600;
              }
              
              .overview-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
              }
              
              .overview-item {
                display: flex;
                align-items: center;
                padding: 10px 0;
              }
              
              .overview-item strong {
                color: #4f46e5;
                min-width: 120px;
                font-weight: 600;
              }
              
              .section-title {
                color: #1f2937;
                font-size: 1.8rem;
                font-weight: 700;
                margin: 40px 0 20px 0;
                padding-bottom: 10px;
                border-bottom: 2px solid #4f46e5;
                display: flex;
                align-items: center;
              }
              
              .section-title::before {
                content: '';
                width: 4px;
                height: 30px;
                background: #4f46e5;
                margin-right: 10px;
                border-radius: 2px;
              }
              
              .day-section {
                margin-bottom: 35px;
                page-break-inside: avoid;
                background: white;
                border-radius: 12px;
                padding: 25px;
                box-shadow: 0 2px 15px rgba(0,0,0,0.08);
                border: 1px solid #e2e8f0;
              }
              
              .day-title {
                color: #1f2937;
                font-size: 1.4rem;
                font-weight: 600;
                margin-bottom: 20px;
                padding: 15px 20px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-radius: 8px;
                text-align: center;
              }
              
              .activity {
                margin-bottom: 20px;
                padding: 20px;
                border-left: 4px solid #4f46e5;
                background: #f8fafc;
                border-radius: 0 8px 8px 0;
                transition: all 0.3s ease;
              }
              
              .activity:hover {
                background: #f1f5f9;
                transform: translateX(5px);
              }
              
              .activity-name {
                color: #1f2937;
                font-size: 1.1rem;
                font-weight: 600;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
              }
              
              .activity-name::before {
                content: '📍';
                margin-right: 8px;
                font-size: 1rem;
              }
              
              .activity-details {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
                margin-bottom: 10px;
                font-size: 0.9rem;
              }
              
              .detail-item {
                display: flex;
                align-items: center;
                color: #64748b;
                font-weight: 500;
              }
              
              .detail-item::before {
                margin-right: 5px;
              }
              
              .rating::before { content: '⭐'; }
              .duration::before { content: '⏱️'; }
              .time::before { content: '🕐'; }
              
              .activity-description {
                color: #475569;
                font-style: italic;
                line-height: 1.5;
                background: white;
                padding: 12px;
                border-radius: 6px;
                border-left: 3px solid #cbd5e1;
              }
              
              .hotels-section {
                margin-top: 30px;
              }
              
              .hotel-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-top: 20px;
              }
              
              .hotel {
                background: white;
                padding: 20px;
                border-radius: 12px;
                border: 1px solid #e2e8f0;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              
              .hotel h4 {
                color: #1f2937;
                font-size: 1.2rem;
                font-weight: 600;
                margin-bottom: 10px;
                padding-bottom: 8px;
                border-bottom: 2px solid #4f46e5;
              }
              
              .hotel-details {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 12px;
              }
              
              .hotel-detail {
                display: flex;
                align-items: center;
                color: #64748b;
                font-size: 0.9rem;
              }
              
              .hotel-detail::before {
                margin-right: 8px;
              }
              
              .hotel-address::before { content: '📍'; }
              .hotel-price::before { content: '💰'; }
              .hotel-rating::before { content: '⭐'; }
              
              .hotel-description {
                color: #475569;
                font-size: 0.9rem;
                line-height: 1.4;
                background: #f8fafc;
                padding: 12px;
                border-radius: 6px;
              }
              
              .footer {
                text-align: center;
                margin-top: 50px;
                padding: 25px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-radius: 12px;
              }
              
              .footer p {
                margin: 5px 0;
                font-weight: 500;
              }
              
              .no-data {
                text-align: center;
                color: #64748b;
                font-style: italic;
                padding: 30px;
                background: #f8fafc;
                border-radius: 8px;
                border: 2px dashed #cbd5e1;
              }
              
              @media print {
                .container { padding: 10px; }
                .day-section { page-break-inside: avoid; }
                .hotel { page-break-inside: avoid; }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <!-- Header -->
              <div class="header">
                  <h1>🧳 Travel Itinerary</h1>
                  <h2>${locationName}</h2>
              </div>

              <!-- Trip Overview -->
              <div class="trip-overview">
                  <h3>📋 Trip Overview</h3>
                  <div class="overview-grid">
                      <div class="overview-item">
                          <strong>📍 Location:</strong> ${locationName}
                      </div>
                      <div class="overview-item">
                          <strong>⏰ Duration:</strong> ${tripData.duration || 'N/A'}
                      </div>
                      <div class="overview-item">
                          <strong>💰 Budget:</strong> ${tripData.budget || 'N/A'}
                      </div>
                      <div class="overview-item">
                          <strong>👥 Travelers:</strong> ${tripData.travelers || 'N/A'}
                      </div>
                      ${tripData.bestTimeToVisit ? `
                      <div class="overview-item" style="grid-column: 1/-1;">
                          <strong>🌟 Best Time:</strong> ${tripData.bestTimeToVisit}
                      </div>` : ''}
                  </div>
              </div>

              <!-- Daily Itinerary -->
              ${tripData.itinerary && tripData.itinerary.length > 0 ? `
                  <h2 class="section-title">🗓️ Daily Itinerary</h2>
                  ${tripData.itinerary.map((day, i) => 
                  {
                    console.log(`Processing day ${i + 1}:`, day);
                    return `
                      <div class="day-section">
                          <h3>Day ${day.dayNumber || day.day || i + 1}: ${day.theme || day.title || day.name || `Day ${i + 1}`}</h3>
                          ${day.activities && day.activities.length > 0 ? `
                              ${day.activities.map((activity, idx) => {
                                console.log(`  Activity ${idx + 1}:`, activity);
                                return `
                                  <div class="activity">
                                    <strong>${idx + 1}. ${activity.name || activity.placeName || activity.title || 'Activity'}</strong>
                                    ${activity.time ? `<div class="activity-details">⏰ ${activity.time}</div>` : ''}
                                    ${activity.rating ? `<div class="activity-details">⭐ Rating: ${activity.rating}</div>` : ''}
                                    ${activity.duration || activity.timeTravelEachLocation ? `<div class="activity-details">⏱️ Duration: ${activity.duration || activity.timeTravelEachLocation}</div>` : ''}
                                    ${activity.description || activity.placeDetails ? `<div class="activity-description">${activity.description || activity.placeDetails}</div>` : ''}
                                  </div>
                                `;
                              }).join('')}
                          ` : `<p style="color: #6b7280; font-style: italic;">No activities planned for this day</p>`}
                      </div>
                    `;
                  }).join('')}
              ` : '<div class="debug-info">No itinerary data found</div>'}

              <!-- Hotels Section -->
              ${tripData.hotels && tripData.hotels.length > 0 ? `
              <div class="hotels-section">
                  <h3>🏨 Recommended Hotels</h3>
                  ${tripData.hotels.map((hotel, idx) => {
                    console.log(`Hotel ${idx + 1}:`, hotel);
                    return `
                      <div class="hotel">
                          <h4>${hotel.name || hotel.hotelName || hotel.title || 'Hotel'}</h4>
                          ${hotel.address || hotel.hotelAddress || hotel.location ? `<p><strong>📍 Address:</strong> ${hotel.address || hotel.hotelAddress || hotel.location}</p>` : ''}
                          ${hotel.price ? `<p><strong>💰 Price:</strong> ₹${hotel.price}</p>` : ''}
                          ${hotel.rating ? `<p><strong>⭐ Rating:</strong> ${hotel.rating}</p>` : ''}
                          ${hotel.description || hotel.descriptions ? `<p>${hotel.description || hotel.descriptions}</p>` : ''}
                      </div>
                    `;
                  }).join('')}
              </div>` : '<div class="debug-info">No hotels data found</div>'}

              <!-- Footer -->
              <footer>
                  <p>Travel plan generated on ${new Date().toLocaleDateString()}</p>
                  <p>Have a wonderful trip! ✈️🌟</p>
              </footer>
          </div>
      </body>
      </html>
    `;

    console.log('🎨 HTML generated, launching Puppeteer...');

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    console.log('🚀 Browser launched');
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    console.log('📄 Page content set');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.5cm', bottom: '0.5cm', left: '0.5cm', right: '0.5cm' },
    });
    
    console.log('📋 PDF generated, buffer size:', pdfBuffer.length);

    await browser.close();
    console.log('🔒 Browser closed');

    const filename = `${locationName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    console.log('📁 Filename:', filename);

    console.log('✅ PDF generation successful!');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('❌ PDF generation error:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to generate PDF', 
      details: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'PDF API is working! Use POST to generate PDF.',
    timestamp: new Date().toISOString()
  });
}