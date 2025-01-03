const fs = require('fs');
const path = require('path');
const exceljs = require('exceljs');

const generateCombinedSheet = async () => {
  const uploadsDir = path.join(__dirname, '../uploads');
  const combinedFilePath = path.join(__dirname, '../output', 'combined_data.xlsx');
  
  const files = fs.readdirSync(uploadsDir);
  let allData = [];

  // Step 1: Collect all data
  for (let file of files) {
    const filePath = path.join(uploadsDir, file);
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.worksheets[0];
    const seenInvoices = new Set();
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        const invoice = row.values[4]; // Assuming Invoice is in the 4th column
        if (!seenInvoices.has(invoice)) {
          seenInvoices.add(invoice); // Add invoice to the set
          allData.push(row.values); // Add unique row to allData array
        }
      }
    });
  }

  // Step 2: Create a new workbook for combined data
  const combinedWorkbook = new exceljs.Workbook();
  const combinedSheet = combinedWorkbook.addWorksheet('Combined Data');

  // Step 3: Define headers
  combinedSheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'BSO Associate Name', key: 'bsoName', width: 20 },
    { header: 'Dos', key: 'dos', width: 15 },
    { header: 'Invoice', key: 'invoice', width: 20 },
    { header: 'Work Queue', key: 'workQueue', width: 15 },
    { header: 'Edit Error', key: 'editError', width: 40 },
    { header: 'Status', key: 'status', width: 10 }
  ];

  // Step 4: Add data to the combined sheet
  for (let row of allData) {
    const newRow = combinedSheet.addRow({
      // Here Our all data is inside an array so extract it in below format
      // [
      //   <1 empty item>,
      //   2024-11-19T00:00:00.000Z, // working date
      //   'dinesh kumar',
      //   2024-11-15T00:00:00.000Z, // date of service
      //   '1371043',
      //   1216,
      //   '(REG) MULTIPLE COVERAGES WITH SAME SUBSCRIBER ID',
      //   'Done'
      // ],
      date: row[1] || '', 
      bsoName: row[2] || '',
      dos: row[3] || '',
      invoice: row[4],
      workQueue: row[5] || '',
      editError: row[6] || '',
      status: 'Done'
    });

  // Apply alignment to the newly added row and column
  newRow.eachCell((cell) => {
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  }

  // Step 5: Save the combined Excel file
  await combinedWorkbook.xlsx.writeFile(combinedFilePath);
  console.log(`Combined file created at: ${combinedFilePath}`);
  
  return combinedFilePath; // Return file path for further processing
};

const generateSummaryReport = async () => {
  const outputFilePath = path.join(__dirname, '../output', 'combined_data.xlsx');
  const summaryFilePath = path.join(__dirname, '../output', 'team_summary.xlsx');

  let rawData = [];
  
    // Step 1: Read data from the combined Excel file
  const workbook = new exceljs.Workbook();
  await workbook.xlsx.readFile(outputFilePath);

    const worksheet = workbook.worksheets[0];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        rawData.push({
          associate: row.getCell(2).value, // BSO Associate Name
          workQueue: row.getCell(5).value, // Work Queue
        });
      }
    });

  // Step 2: Aggregate data
  const summary = {};
  rawData.forEach(entry => {
    const { associate, workQueue } = entry;

    if (!summary[associate]) summary[associate] = {};
    if (!summary[associate][workQueue]) summary[associate][workQueue] = 0;

    summary[associate][workQueue]++;
  });

  // Step 3: Generate the summary workbook
  const summaryWorkbook = new exceljs.Workbook();
  const summarySheet = summaryWorkbook.addWorksheet('Team Summary');

  // Define headers
  const workQueues = [...new Set(rawData.map(item => item.workQueue))].sort(); // Unique work queues
  const headers = ['BSO Associate Name', ...workQueues, 'Grand Total'];

  // Set column widths and headers
  summarySheet.columns = headers.map(header => ({ header, key: header, width: 15 }));
// Style the header row
summarySheet.getRow(1).eachCell((cell) => {
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0000FF' } // Blue color in ARGB format
  };
  cell.font = {
    bold: true, // Make the text bold for better visibility
    color: { argb: 'FFFFFFFF' } // White text color
  };
});
  // Step 4: Add data rows
  let grandTotal = 0;

  for (let associate in summary) {
    const row = { 'BSO Associate Name': associate };
    let associateTotal = 0;

    workQueues.forEach(queue => {
      const count = summary[associate][queue] || 0;
      row[queue] = count;
      associateTotal += count;
    });

    row['Grand Total'] = associateTotal;
    grandTotal += associateTotal;

    summarySheet.addRow(row);
  }

  // Step 5: Add Grand Total Row
  const totalRow = { 'BSO Associate Name': 'Grand Total' };
  workQueues.forEach(queue => {
    totalRow[queue] = Object.values(summary).reduce((sum, assoc) => sum + (assoc[queue] || 0), 0);
  });
  totalRow['Grand Total'] = grandTotal;

 // Add the 'Grand Total' row
const grandTotalRow = summarySheet.addRow(totalRow);

// Style the 'Grand Total' row
grandTotalRow.eachCell((cell) => {
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFF00' } // Yellow color in ARGB format
  };
  cell.font = {
    bold: true // Make the text bold for better emphasis
  };
});

  // Step 6: Save the file
  await summaryWorkbook.xlsx.writeFile(summaryFilePath);
  console.log(`Summary report created: ${summaryFilePath}`);

  return summaryFilePath; // Return the file path
};



module.exports = { generateCombinedSheet, generateSummaryReport };
