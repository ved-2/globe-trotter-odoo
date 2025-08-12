import jsPDF from 'jspdf';
import { format } from 'date-fns';

// Color palette
const colors = {
  primary: [59, 130, 246],      // Blue
  secondary: [99, 102, 241],    // Indigo
  accent: [34, 197, 94],        // Green
  warning: [245, 158, 11],      // Amber
  text: [31, 41, 55],           // Gray-800
  textLight: [107, 114, 128],   // Gray-500
  background: [248, 250, 252],  // Gray-50
  white: [255, 255, 255],
  border: [229, 231, 235]       // Gray-200
};

// Utility: safely parse various date shapes
const parseDate = (d) => {
  if (!d) return null;
  if (d instanceof Date) return d;
  if (typeof d === 'string' || typeof d === 'number') {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt;
  }
  if (typeof d === 'object' && d.$date) {
    const dt = new Date(d.$date);
    return isNaN(dt.getTime()) ? null : dt;
  }
  return null;
};

const fmtDate = (d, fmt = 'EEEE, MMMM d, yyyy') => {
  const dt = parseDate(d);
  return dt ? format(dt, fmt) : '';
};

const sanitizeFilename = (name) =>
  (name || 'travel-plan').replace(/[^a-z0-9]/gi, '_');

export const generateTravelPDF = (plan) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const contentWidth = pageWidth - (2 * margin);
  let y = margin;

  const checkNewPage = (requiredSpace = 20) => {
    if (y + requiredSpace > pageHeight - margin - 20) {
      addPageFooter();
      doc.addPage();
      y = margin;
    }
  };

  const addPageFooter = () => {
    const pageNum = doc.internal.getNumberOfPages();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colors.textLight);
    const pageText = `Page ${pageNum}`;
    const textWidth = doc.getTextWidth(pageText);
    doc.text(pageText, pageWidth - margin - textWidth, pageHeight - 10);
  };

  const addWrappedText = (text, x, maxWidth, fontSize = 10, lineGap = 5, color = colors.text) => {
    if (!text) return;
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    
    // Ensure we don't exceed content bounds
    const safeMaxWidth = Math.min(maxWidth, contentWidth - (x - margin));
    const lines = doc.splitTextToSize(text, safeMaxWidth);
    
    lines.forEach((line) => {
      checkNewPage(fontSize + lineGap);
      doc.text(line, x, y);
      y += fontSize + lineGap;
    });
  };

  const sectionHeader = (title, icon = '✈', bgColor = colors.primary) => {
    checkNewPage(25);
    
    // Background gradient effect
    doc.setFillColor(...bgColor);
    doc.roundedRect(margin, y - 2, contentWidth, 16, 3, 3, 'F');
    
    // Add subtle shadow effect
    doc.setFillColor(0, 0, 0);
    doc.setGState(doc.GState({opacity: 0.1}));
    doc.roundedRect(margin + 1, y - 1, contentWidth, 16, 3, 3, 'F');
    doc.setGState(doc.GState({opacity: 1}));
    
    // Icon and title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...colors.white);
    doc.text(`${icon} ${title}`, margin + 8, y + 9);
    
    y += 20;
    doc.setTextColor(...colors.text);
  };

  const addInfoCard = (items, cardColor = colors.background) => {
    if (!items.length) return;
    
    checkNewPage(items.length * 8 + 12);
    
    const cardHeight = items.length * 8 + 8;
    
    // Card background
    doc.setFillColor(...cardColor);
    doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, 'F');
    
    // Card border
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, 'S');
    
    y += 6;
    items.forEach((item) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(...colors.text);
      
      // Ensure text doesn't overflow
      const maxTextWidth = contentWidth - 16;
      const lines = doc.splitTextToSize(`• ${item}`, maxTextWidth);
      lines.forEach((line) => {
        doc.text(line, margin + 8, y);
        y += 8;
      });
    });
    y += 4;
  };

  const addDivider = () => {
    checkNewPage(8);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  };

  // Header with gradient background
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Title
  const destinationName = plan?.destination?.name || plan?.location || plan?.title || 'Trip';
  const titleText = plan?.title || `Travel Itinerary: ${destinationName}`;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22); // Slightly smaller to prevent overflow
  doc.setTextColor(...colors.white);
  
  // Ensure title fits within page width
  let adjustedTitle = titleText;
  let titleWidth = doc.getTextWidth(adjustedTitle);
  while (titleWidth > contentWidth && adjustedTitle.length > 10) {
    adjustedTitle = adjustedTitle.substring(0, adjustedTitle.length - 3) + '...';
    titleWidth = doc.getTextWidth(adjustedTitle);
  }
  
  doc.text(adjustedTitle, (pageWidth - titleWidth) / 2, 25);
  
  // Subtitle in header
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  const subtitle = 'Your personalized travel guide';
  const sw = doc.getTextWidth(subtitle);
  doc.text(subtitle, (pageWidth - sw) / 2, 38);
  
  y = 60;

  // Trip Overview Card
  const start = parseDate(plan?.startDate);
  const end = parseDate(plan?.endDate);
  const startStr = start ? format(start, 'MMM d, yyyy') : '';
  const endStr = end ? format(end, 'MMM d, yyyy') : '';
  const durationDays = start && end ? Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1) : plan?.numberOfDays;

  sectionHeader('Trip Overview', '📍', colors.secondary);
  
  const overviewItems = [
    destinationName ? `Destination: ${destinationName}` : undefined,
    startStr && endStr ? `Travel Dates: ${startStr} → ${endStr}` : undefined,
    durationDays ? `Duration: ${durationDays} day${durationDays > 1 ? 's' : ''}` : undefined,
    plan?.travelGroup ? `Travel Group: ${plan.travelGroup}` : undefined,
    plan?.budget ? `Budget: ${plan.budget}` : undefined,
    plan?.bestTimeToVisit ? `Best Season: ${plan.bestTimeToVisit}` : undefined,
  ].filter(Boolean);

  addInfoCard(overviewItems, [240, 249, 255]); // Light blue background

  // Hotels Section
  if (Array.isArray(plan?.hotels) && plan.hotels.length) {
    addDivider();
    sectionHeader('Recommended Hotels', '🏨', colors.accent);
    
    plan.hotels.forEach((h, idx) => {
      checkNewPage(35);
      
      // Hotel card
      doc.setFillColor(254, 252, 232); // Light yellow background
      doc.roundedRect(margin, y, contentWidth, 30, 2, 2, 'F');
      doc.setDrawColor(...colors.border);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, y, contentWidth, 30, 2, 2, 'S');
      
      y += 8;
      
      // Hotel name with numbering
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...colors.primary);
      
      const hotelName = `${idx + 1}. ${h?.name || h?.hotelName || 'Hotel'}`;
      const maxHotelNameWidth = contentWidth - 16;
      let adjustedHotelName = hotelName;
      let hotelNameWidth = doc.getTextWidth(adjustedHotelName);
      while (hotelNameWidth > maxHotelNameWidth && adjustedHotelName.length > 10) {
        adjustedHotelName = adjustedHotelName.substring(0, adjustedHotelName.length - 3) + '...';
        hotelNameWidth = doc.getTextWidth(adjustedHotelName);
      }
      
      doc.text(adjustedHotelName, margin + 8, y);
      y += 8;

      // Hotel details
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...colors.text);
      
      const priceAmount = h?.price?.amount ?? h?.price;
      const priceCur = h?.price?.currency || 'INR';
      const rating = h?.rating ? ` ⭐ ${h.rating}` : '';
      
      if (priceAmount) {
        const priceText = `💰 ${priceCur} ${priceAmount}${h?.price?.perNight ? ' / night' : ''}${rating}`;
        doc.text(priceText, margin + 12, y);
        y += 6;
      } else if (rating) {
        doc.text(`Rating: ${rating}`, margin + 12, y);
        y += 6;
      }
      
      if (h?.address) {
        doc.text(`📍 ${h.address}`, margin + 12, y);
        y += 6;
      }
      
      y += 8;
    });
    y += 4;
  }

  // Itinerary Section
  if (Array.isArray(plan?.itinerary) && plan.itinerary.length) {
    addDivider();
    sectionHeader('Daily Itinerary', '📅', colors.warning);

    plan.itinerary.forEach((day, dayIdx) => {
      checkNewPage(40);
      
      // Day header card
      doc.setFillColor(255, 247, 237); // Light orange background
      doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'F');
      doc.setDrawColor(...colors.warning);
      doc.setLineWidth(1);
      doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'S');
      
      const dayDateStr = fmtDate(day?.date, 'EEEE, MMM d');
      const header = `Day ${day?.dayNumber || dayIdx + 1}${dayDateStr ? ' • ' + dayDateStr : ''}`;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...colors.warning);
      doc.text(`🗓️ ${header}`, margin + 8, y + 13);
      y += 25;
      
      if (day?.theme) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(11);
        doc.setTextColor(...colors.textLight);
        addWrappedText(`Theme: ${day.theme}`, margin + 4, contentWidth - 8, 11, 5, colors.textLight);
        y += 2;
      }

      if (!Array.isArray(day?.activities) || !day.activities.length) {
        addWrappedText('🛌 No activities planned - rest day!', margin + 4, contentWidth - 8, 11, 5, colors.textLight);
        y += 8;
        // continue;
      }

      day.activities.forEach((act, i) => {
        checkNewPage(35);
        
        // Activity card
        const activityCardWidth = contentWidth - 16;
        doc.setFillColor(249, 250, 251); // Very light gray
        doc.roundedRect(margin + 8, y, activityCardWidth, 25, 2, 2, 'F');
        doc.setDrawColor(...colors.border);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin + 8, y, activityCardWidth, 25, 2, 2, 'S');
        
        y += 6;
        
        // Activity header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...colors.primary);
        
        const st = act?.time?.startTime || act?.time || '';
        const et = act?.time?.endTime ? ` - ${act.time.endTime}` : '';
        const timeStr = st ? `🕐 ${st}${et}` : '';
        const title = act?.title || act?.name || 'Activity';
        const headerLine = timeStr ? `${timeStr} • ${title}` : `🎯 ${title}`;
        
        // Ensure activity title fits within bounds
        const maxActivityWidth = activityCardWidth - 8;
        let adjustedHeaderLine = headerLine;
        let headerWidth = doc.getTextWidth(adjustedHeaderLine);
        while (headerWidth > maxActivityWidth && adjustedHeaderLine.length > 10) {
          adjustedHeaderLine = adjustedHeaderLine.substring(0, adjustedHeaderLine.length - 3) + '...';
          headerWidth = doc.getTextWidth(adjustedHeaderLine);
        }
        
        doc.text(adjustedHeaderLine, margin + 12, y);
        y += 7;

        // Activity details
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...colors.text);
        
        const locName = act?.location?.name || act?.location || '';
        if (locName) {
          doc.text(`📍 ${locName}`, margin + 16, y);
          y += 5;
        }
        
        const costAmount = act?.cost?.amount;
        const costCur = act?.cost?.currency || 'INR';
        if (typeof costAmount === 'number' && costAmount > 0) {
          doc.text(`💰 ${costCur} ${costAmount}`, margin + 16, y);
          y += 5;
        }
        
        y += 4;
      });

      y += 6;
    });
  }

  // Final footer with travel tips
  checkNewPage(35);
  addDivider();
  
  doc.setFillColor(...colors.background);
  doc.roundedRect(margin, y, contentWidth, 25, 3, 3, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.primary);
  doc.text('🌟 Travel Tips', margin + 8, y + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...colors.textLight);
  
  // Ensure tips fit within bounds
  const tipMaxWidth = contentWidth - 16;
  const tip1 = '• Keep digital and physical copies of important documents';
  const tip2 = '• Check local weather and customs before departure';
  
  const tip1Lines = doc.splitTextToSize(tip1, tipMaxWidth);
  const tip2Lines = doc.splitTextToSize(tip2, tipMaxWidth);
  
  let tipY = y + 17;
  tip1Lines.forEach((line) => {
    doc.text(line, margin + 8, tipY);
    tipY += 5;
  });
  tip2Lines.forEach((line) => {
    doc.text(line, margin + 8, tipY);
    tipY += 5;
  });
  
  y += 30;
  
  // Generation info
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textLight);
  const foot = `Generated on ${format(new Date(), 'MMMM d, yyyy')} • Have an amazing trip! ✈️`;
  const fw = doc.getTextWidth(foot);
  doc.text(foot, (pageWidth - fw) / 2, y);

  // Add page numbers to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colors.textLight);
    const pageText = `Page ${i} of ${totalPages}`;
    const pageTextWidth = doc.getTextWidth(pageText);
    doc.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 10);
  }

  // Save with enhanced filename
  const fileBase = sanitizeFilename(destinationName || plan?.title || 'travel-plan');
  const ts = format(new Date(), 'yyyy-MM-dd');
  doc.save(`${fileBase}_itinerary_${ts}.pdf`);
};

export default generateTravelPDF;