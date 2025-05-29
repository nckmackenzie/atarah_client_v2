import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const usePdfConverter = (elementId: string, saveAs: string) => {
  const [isConverting, setIsConverting] = useState(false);

  const convertToPdf = () => {
    const targetElement = document.getElementById(elementId);

    if (!targetElement) {
      console.error(`Target element not found.`);
      return;
    }

    setIsConverting(true);

    // Use html2canvas to render the element to a canvas
    html2canvas(targetElement, { useCORS: false })
      .then(canvas => {
        // Get the canvas's data as a data URL
        const imageData = canvas.toDataURL('image/png');

        // Calculate the dimensions of the PDF
        const pdfWidth = 210; // A4 width in mm
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // Create a new jsPDF instance
        const pdf = new jsPDF('p', 'mm', 'a4');

        pdf.addImage(imageData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(saveAs);

        setIsConverting(false);
      })
      .catch(error => {
        console.error('Error converting to PDF:', error);
        setIsConverting(false);
      });
  };

  return { convertToPdf, isConverting };
};

export default usePdfConverter;
