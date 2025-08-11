
import puppeteer from 'puppeteer';
import { connectToDatabase } from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { auth } from '@clerk/nextjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = auth(req);
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
      userId: new ObjectId(userId)
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Format time helper
    const formatTime = (timeStr) => {
      if (!timeStr || timeStr === 'TBD') return 'TBD';
      try {
        if (timeStr.includes(':')) {
          const [hours, minutes] = timeStr.split(':');
          const hour = parseInt(hours);
          const min = minutes ? minutes.padStart(2, '0') : '00';
          const period = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
          return `${displayHour}:${min} ${period}`;
        }
        return timeStr;
      } catch (e) {
        return timeStr || 'TBD';
      }
    };

    // Format date helper
    const formatDate = (date) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
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
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            min-height: 100vh;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="white" opacity="0.1"/></svg>') repeat;
            animation: float 20s infinite linear;
        }
        
        @keyframes float {
            0% { transform: translateX(0) translateY(0); }
            100% { transform: translateX(-100px) translateY(-100px); }
        }
        
        .header-content {
            position: relative;
            z-index: 2;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header .emoji {
            font-size: 1.2em;
            margin-right: 10px;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .trip-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9ff;
        }
        
        .info-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
            border-left: 4px solid #667eea;
        }
        
        .info-card .icon {
            font-size: 2em;
            margin-bottom: 10px;
            display: block;
        }
        
        .info-card .label {
            font-size: 0.9em;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }
        
        .info-card .value {
            font-size: 1.1em;
            font-weight: 600;
            color: #333;
        }
        
        .content {
            padding: 30px;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section-title {
            font-size: 1.8em;
            color: #667eea;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
            display: flex;
            align-items: center;
        }
        
        .section-title .emoji {
            margin-right: 10px;
        }
        
        .hotels-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .hotel-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 6px 12px rgba(0,0,0,0.1);
            border: 1px solid #e0e7ff;
        }
        
        .hotel-card .hotel-image {
            width: 100%;
            height: 150px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 3em;
        }
        
        .hotel-card .hotel-info {
            padding: 20px;
        }
        
        .hotel-card .hotel-name {
            font-size: 1.2em;
            font-weight: 600;
            margin-bottom: 5px;
            color: #333;
        }
        
        .hotel-card .hotel-address {
            color: #666;
            margin-bottom: 10px;
        }
        
        .hotel-card .hotel-details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .hotel-card .price {
            font-size: 1.1em;
            font-weight: 600;
            color: #10b981;
        }
        
        .hotel-card .rating {
            color: #fbbf24;
        }
        
        .itinerary {
            background: #f8f9ff;
            padding: 20px;
            border-radius: 12px;
        }
        
        .day-card {
            background: white;
            margin-bottom: 30px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            border-left: 6px solid #667eea;
        }
        
        .day-header {
            background: linear-gradient(90deg, #667eea, #764ba2);
            color: white;
            padding: 20px;
            font-weight: 600;
            font-size: 1.2em;
        }
        
        .day-activities {
            padding: 20px;
        }
        
        .activity {
            background: #f8f9ff;
            margin-bottom: 15px;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #10b981;
            position: relative;
        }
        
        .activity:last-child {
            margin-bottom: 0;
        }
        
        .activity-title {
            font-weight: 600;
            margin-bottom: 8px;
            color: #333;
            font-size: 1.05em;
        }
        
        .activity-description {
            color: #555;
            margin-bottom: 10px;
            line-height: 1.5;
        }
        
        .activity-details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
            font-size: 0.9em;
            color: #666;
        }
        
        .activity-time, .activity-cost {
            background: white;
            padding: 5px 10px;
            border-radius: 20px;
            font-weight: 500;
        }
        
        .activity-time {
            color: #667eea;
            border: 1px solid #667eea;
        }
        
        .activity-cost {
            color: #10b981;
            border: 1px solid #10b981;
        }
        
        .footer {
            background: #1f2937;
            color: #9ca3af;
            padding: 30px;
            text-align: center;
            margin-top: 40px;
        }
        
        .footer p {
            margin-bottom: 10px;
        }
        
        .disclaimer {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
        }
        
        .disclaimer strong {
            color: #92400e;
        }
        
        .disclaimer p {
            color: #78350f;
            margin: 0;
        }

        .no-activities {
            text-align: center;
            padding: 30px;
            color: #6b7280;
            font-style: italic;
        }

        @media print {
            .container {
                box-shadow: none;
            }
            .header::before {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <h1><span class="emoji">✈️</span>${trip.title || `${trip.destination?.name || 'Your'} Travel Plan`}</h1>
                <p>Your AI-Generated Travel Itinerary</p>
            </div>
        </div>
        
        <div class="trip-info">
            <div class="info-card">
                <span class="icon">📍</span>
                <div class="label">Destination</div>
                <div class="value">${trip.destination?.name || trip.location || 'N/A'}</div>
            </div>
            <div class="info-card">
                <span class="icon">📅</span>
                <div class="label">Duration</div>
                <div class="value">${trip.numberOfDays || trip.duration || (trip.itinerary?.length ? `${trip.itinerary.length} days` : 'N/A')}</div>
            </div>
            <div class="info-card">
                <span class="icon">👥</span>
                <div class="label">Travel Group</div>
                <div class="value">${trip.travelGroup || trip.travelers || 'N/A'}</div>
            </div>
            <div class="info-card">
                <span class="icon">💰</span>
                <div class="label">Budget</div>
                <div class="value">${trip.budget || 'N/A'}</div>
            </div>
        </div>
        
        <div class="content">
            ${trip.bestTimeToVisit ? `
            <div class="section">
                <div style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <strong style="color: #1e40af;">Best Time to Visit:</strong>
                    <span style="color: #1e3a8a;">${trip.bestTimeToVisit}</span>
                </div>
            </div>
            ` : ''}
            
            ${trip.hotels && trip.hotels.length > 0 ? `
            <div class="section">
                <h2 class="section-title">
                    <span class="emoji">🏨</span>
                    Hotel Recommendations
                </h2>
                <div class="hotels-grid">
                    ${trip.hotels.map(hotel => `
                    <div class="hotel-card">
                        <div class="hotel-image">🏨</div>
                        <div class="hotel-info">
                            <div class="hotel-name">${hotel.name || hotel.hotelName || 'Hotel'}</div>
                            <div class="hotel-address">${hotel.address || hotel.hotelAddress || 'Address not available'}</div>
                            <div class="hotel-details">
                                <div class="price">$${hotel.price?.amount || hotel.price || 'N/A'}</div>
                                <div class="rating">${'⭐'.repeat(hotel.rating || 0)}</div>
                            </div>
                            <div style="color: #555; font-size: 0.9em; margin-top: 10px;">
                                ${hotel.description || hotel.descriptions || 'No description available'}
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${trip.itinerary && trip.itinerary.length > 0 ? `
            <div class="section">
                <h2 class="section-title">
                    <span class="emoji">🗓️</span>
                    Your Itinerary (${trip.itinerary.length} days)
                </h2>
                <div class="itinerary">
                    ${trip.itinerary.map((day, idx) => `
                    <div class="day-card">
                        <div class="day-header">
                            Day ${day.dayNumber || idx + 1}: ${day.theme || `Day ${idx + 1}`}
                            ${day.date ? `<div style="font-size: 0.9em; opacity: 0.9; margin-top: 5px;">${formatDate(day.date)}</div>` : ''}
                        </div>
                        <div class="day-activities">
                            ${day.activities && day.activities.length > 0 ? day.activities.map((activity, aIdx) => `
                            <div class="activity">
                                <div class="activity-title">${activity.title || activity.placeName || 'Activity'}</div>
                                <div class="activity-description">${activity.description || activity.placeDetails || 'No description available'}</div>
                                <div class="activity-details">
                                    <div class="activity-time">⏰ ${formatTime(activity.time?.startTime || activity.timeTravelEachLocation)}</div>
                                    ${(activity.cost?.amount && activity.cost.amount > 0) ? `<div class="activity-cost">💰 $${activity.cost.amount}</div>` : ''}
                                    ${activity.rating ? `<div style="color: #fbbf24;">⭐ ${activity.rating}</div>` : ''}
                                </div>
                            </div>
                            `).join('') : '<div class="no-activities">No activities planned for this day</div>'}
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${trip.disclaimer ? `
            <div class="disclaimer">
                <p><strong>Disclaimer:</strong> ${trip.disclaimer}</p>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>Have an amazing trip! ✨</p>
        </div>
    </div>
</body>
</html>`;

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ]
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    });

    await browser.close();

    // Set response headers for PDF download
    const filename = `${trip.title?.replace(/[^a-z0-9]/gi, '_') || 'travel-plan'}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdf.length);
    
    res.send(pdf);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate PDF', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}