import puppeteer from 'puppeteer';
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { parse, format, differenceInMinutes } from 'date-fns'; // Import for robust time formatting
import { useAuth } from '@clerk/nextjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = useAuth(); // Clerk's recommended way to get auth in API routes
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid trip ID' });
    }

    // Fetch trip from database
    const { db } = await connectToDatabase();
    const trip = await db.collection('trips').findOne({
      _id: new ObjectId(id),
      // Note: userId in the DB should be a string from Clerk, not an ObjectId unless you explicitly convert it
      userId: userId,
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or you do not have permission.' });
    }

    // --- IMPROVED HELPER FUNCTIONS ---

    // More robust helper to format time ranges and durations
    const formatActivityTime = (time) => {
      if (!time) return '⏰ Time TBD';

      const { startTime, endTime } = time;
      if (!startTime) return '⏰ Time TBD';

      try {
        const start = parse(startTime, 'HH:mm', new Date());
        if (endTime) {
          const end = parse(endTime, 'HH:mm', new Date());
          const duration = differenceInMinutes(end, start);
          let durationString = '';
          if (duration > 0) {
            const hours = Math.floor(duration / 60);
            const mins = duration % 60;
            durationString = `(${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''})`.trim();
          }
          return `⏰ ${format(start, 'h:mm a')} - ${format(end, 'h:mm a')} ${durationString}`;
        }
        return `⏰ Starts at ${format(start, 'h:mm a')}`;
      } catch {
        return `⏰ ${startTime}`; // Fallback for non-standard formats
      }
    };
    
    // Helper to format a specific date for day headers
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return '';
        }
    };


    // Generate HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${trip.title || 'Travel Plan'}</title>
    <style>
      /* --- Paste your complete CSS here --- */
      /* For brevity, I'm omitting the full CSS block, but it should be the same as your original */
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
      .header h1 { font-size: 2.5em; }
      .trip-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; padding: 30px; background: #f8f9ff; }
      .info-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center; border-left: 4px solid #667eea; }
      .info-card .label { font-size: 0.9em; color: #666; text-transform: uppercase; }
      .info-card .value { font-size: 1.1em; font-weight: 600; }
      .section-title { font-size: 1.8em; color: #667eea; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 3px solid #667eea; }
      .day-card { margin-bottom: 30px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border: 1px solid #eef; }
      .day-header { background: #f8f9ff; color: #667eea; padding: 15px 20px; font-weight: 600; font-size: 1.2em; border-bottom: 1px solid #eef; }
      .day-activities { padding: 20px; }
      .activity { margin-bottom: 15px; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; background: #f8f9ff; }
      .activity-title { font-weight: 600; font-size: 1.05em; margin-bottom: 5px; }
      .activity-details { display: flex; gap: 15px; margin-top: 10px; font-size: 0.9em; }
      .hotel-card { border: 1px solid #eef; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05); }
      .hotel-image { width: 100%; height: 180px; object-fit: cover; background-color: #f0f0f0; }
      .hotel-info { padding: 15px; }
      .footer { text-align: center; padding: 20px; font-size: 0.9em; color: #777; margin-top: 30px; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✈️ ${trip.title || `${trip.destination?.name || 'Your'} Travel Plan`}</h1>
            <p>Your AI-Generated Travel Itinerary</p>
        </div>
        
        <div class="trip-info">
            <div class="info-card"><div class="label">Destination</div><div class="value">${trip.destination?.name || trip.location || 'N/A'}</div></div>
            <div class="info-card"><div class="label">Duration</div><div class="value">${trip.numberOfDays || trip.duration || (trip.itinerary?.length ? `${trip.itinerary.length} days` : 'N/A')}</div></div>
            <div class="info-card"><div class="label">Travel Group</div><div class="value">${trip.travelGroup || trip.travelers || 'N/A'}</div></div>
            <div class="info-card"><div class="label">Budget</div><div class="value">${trip.budget || 'N/A'}</div></div>
        </div>
        
        <div class="content" style="padding: 30px;">
            ${(trip.hotels && trip.hotels.length > 0) ? `
            <div class="section">
                <h2 class="section-title">🏨 Hotel Recommendations</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                ${trip.hotels.map(hotel => `
                    <div class="hotel-card">
                        ${hotel.imageUrl || hotel.hotelImageUrl ? `<img src="${hotel.imageUrl || hotel.hotelImageUrl}" alt="${hotel.name || 'Hotel'}" class="hotel-image">` : ''}
                        <div class="hotel-info">
                            <div style="font-size: 1.2em; font-weight: 600;">${hotel.name || hotel.hotelName}</div>
                            <div style="font-size: 0.9em; color: #666; margin-bottom: 10px;">${hotel.address || hotel.hotelAddress || ''}</div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #10b981; font-weight: bold;">$${hotel.price?.amount || hotel.price || 'N/A'}</span>
                                <span style="color: #fbbf24;">${'⭐'.repeat(Math.round(hotel.rating) || 0)}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${(trip.itinerary && trip.itinerary.length > 0) ? `
            <div class="section">
                <h2 class="section-title">🗓 Your Itinerary</h2>
                ${trip.itinerary.map((day, idx) => `
                <div class="day-card">
                    <div class="day-header">
                        Day ${day.dayNumber || idx + 1}: ${day.theme || `Day ${idx + 1}`}
                        ${day.date ? `<div style="font-size: 0.8em; opacity: 0.8; font-weight: normal;">${formatDate(day.date)}</div>` : ''}
                    </div>
                    <div class="day-activities">
                        ${(day.activities && day.activities.length > 0) ? day.activities.map(activity => `
                        <div class="activity">
                            <div class="activity-title">${activity.title || activity.placeName || 'Activity'}</div>
                            <p>${activity.description || activity.placeDetails || ''}</p>
                            <div class="activity-details">
                                <span style="font-weight: 500; color: #333;">${formatActivityTime(activity.time)}</span>
                                ${(activity.cost?.amount > 0) ? `<span>💰 $${activity.cost.amount}</span>` : ''}
                            </div>
                        </div>
                        `).join('') : '<div style="text-align: center; padding: 20px; color: #888;">No activities planned for this day.</div>'}
                    </div>
                </div>
                `).join('')}
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
             <p>Generated on ${new Date().toLocaleDateString()}</p>
             <p>Have an amazing trip! ✨</p>
        </div>
    </div>
</body>
</html>`;

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({ format: 'A4', printBackground: true });

    await browser.close();

    // Set response headers for PDF download
    // FIXED: Added backticks for template literal
    const filename = `${trip.title?.replace(/[^a-z0-9]/gi, '_') || 'travel-plan'}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    // FIXED: Made the header value a valid string
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdf);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate PDF', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}