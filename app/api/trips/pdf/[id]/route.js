// app/api/trips/pdf/[id]/route.js

import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { format, parse } from 'date-fns';

export async function GET(request, { params }) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Trip ID' }, { status: 400 });
    }

    // --- Fetch Trip Data ---
    const { db } = await connectToDatabase();
    const trip = await db.collection('trips').findOne({
      _id: new ObjectId(id),
      userId: userId, 
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found or access denied' }, { status: 404 });
    }

    // --- Helper Functions for Formatting ---
    const formatDateRange = (start, end) => {
        if (!start || !end) return 'N/A';
        return `${format(new Date(start), 'MMM d, yyyy')} - ${format(new Date(end), 'MMM d, yyyy')}`;
    };
    
    const formatActivityTime = (time) => {
        if (!time || !time.startTime) return '';
        try {
            const start = format(parse(time.startTime, 'HH:mm', new Date()), 'h:mm a');
            if (time.endTime) {
                const end = format(parse(time.endTime, 'HH:mm', new Date()), 'h:mm a');
                return `⏰ ${start} - ${end}`;
            }
            return `⏰ ${start}`;
        } catch {
            return '';
        }
    };


    // --- Generate Dynamic HTML Content ---
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>${trip.title || 'Your Trip Itinerary'}</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
              body { font-family: 'Poppins', sans-serif; margin: 0; padding: 0; background-color: #f9fafb; color: #1f2937; -webkit-print-color-adjust: exact; }
              .page { width: 210mm; min-height: 297mm; padding: 1.5cm; margin: 1cm auto; background: white; box-shadow: 0 0 0.5cm rgba(0,0,0,0.1); page-break-after: always; }
              .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 30px; margin-bottom: 30px; }
              .header h1 { font-size: 36px; color: #4338ca; margin: 0; }
              .header h2 { font-size: 24px; color: #4f46e5; margin: 10px 0 0; font-weight: 500; }
              .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
              .info-card { background-color: #f3f4f6; border-radius: 8px; padding: 15px; text-align: center; }
              .info-card .label { font-size: 12px; text-transform: uppercase; color: #6b7280; margin-bottom: 5px; }
              .info-card .value { font-size: 16px; font-weight: 600; color: #1e293b; }
              .section-title { font-size: 24px; font-weight: 700; color: #4338ca; margin-top: 40px; margin-bottom: 20px; border-bottom: 2px solid #e0e7ff; padding-bottom: 10px; }
              .hotels-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              .hotel-card { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
              .hotel-card img { width: 100%; height: 160px; object-fit: cover; background-color: #e0e7ff; }
              .hotel-info { padding: 15px; }
              .hotel-info h4 { margin: 0 0 5px; font-size: 16px; }
              .hotel-info .rating { color: #f59e0b; }
              .itinerary-day { margin-bottom: 30px; }
              .day-header { background-color: #eef2ff; color: #4338ca; padding: 15px; border-radius: 8px; font-size: 20px; font-weight: 600; margin-bottom: 20px; }
              .activity-card { border-left: 4px solid #818cf8; background-color: #f9fafb; padding: 15px; border-radius: 4px; margin-bottom: 15px; }
              .activity-title { font-size: 16px; font-weight: 600; margin-bottom: 5px; }
              .activity-time { font-weight: 500; color: #6366f1; margin-bottom: 8px; }
              .activity-description { font-size: 14px; color: #4b5563; }
          </style>
      </head>
      <body>
          <div class="page">
              <div class="header">
                  <h1>${trip.title}</h1>
                  <h2>${trip.destination.name}</h2>
              </div>
              <div class="summary-grid">
                  <div class="info-card"><div class="label">Dates</div><div class="value">${formatDateRange(trip.startDate, trip.endDate)}</div></div>
                  <div class="info-card"><div class="label">Duration</div><div class="value">${trip.numberOfDays} Days</div></div>
                  <div class="info-card"><div class="label">Travelers</div><div class="value">${trip.travelGroup}</div></div>
                  <div class="info-card"><div class="label">Budget</div><div class="value">${trip.budget}</div></div>
                  <div class="info-card"><div class="label">Status</div><div class="value">${trip.status}</div></div>
                  <div class="info-card"><div class="label">Best Time to Visit</div><div class="value">${trip.bestTimeToVisit}</div></div>
              </div>

              ${(trip.hotels && trip.hotels.length > 0) ? `
              <div class="section">
                  <h3 class="section-title">🏨 Hotel Recommendations</h3>
                  <div class="hotels-grid">
                  ${trip.hotels.map(hotel => `
                      <div class="hotel-card">
                          ${hotel.imageUrl ? `<img src="${hotel.imageUrl}" alt="${hotel.name}">` : ''}
                          <div class="hotel-info">
                              <h4>${hotel.name}</h4>
                              <p class="rating">${'⭐'.repeat(Math.round(hotel.rating || 0))}</p>
                              <p style="font-size: 14px; color: #4b5563;">${hotel.description}</p>
                              <p style="font-weight: 600; margin-top: 10px;">Price: $${hotel.price?.amount || 'N/A'}/night</p>
                          </div>
                      </div>
                  `).join('')}
                  </div>
              </div>` : ''}
          </div>

          ${trip.itinerary.map(day => `
          <div class="page">
              <div class="itinerary-day">
                  <div class="day-header">Day ${day.dayNumber}: ${day.theme}</div>
                  <div class="activities-list">
                  ${day.activities.map(activity => `
                      <div class="activity-card">
                          <div class="activity-title">${activity.title}</div>
                          ${activity.time ? `<div class="activity-time">${formatActivityTime(activity.time)}</div>` : ''}
                          <div class="activity-description">${activity.description}</div>
                      </div>
                  `).join('')}
                  </div>
              </div>
          </div>
          `).join('')}
      </body>
      </html>
    `;

    // --- Launch Puppeteer to Generate PDF ---
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>', // Empty header
      footerTemplate: `
        <div style="width:100%; text-align:center; font-size:10px; padding: 0 1.5cm 1cm;">
          <span>${trip.title}</span> | Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>`,
      margin: { top: '1.5cm', bottom: '2cm', left: '1.5cm', right: '1.5cm' }
    });

    await browser.close();

    // --- Send PDF as Response ---
    const filename = `${trip.title.replace(/[^a-z0-9]/gi, '_') || 'trip'}_itinerary.pdf`;
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}