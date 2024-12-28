const { fetchEmails } = require('./emailControllers');
const { generateCombinedSheet } = require('./sheetController');
const { sendEmailWithAttachment } = require('./emailControllers');
const { generateSummaryReport } = require('./sheetController');
const { sendSummaryReport } = require('./emailControllers');


const autoProcessReports = async (req, res) => {
  let recepients;
    try {
      console.log('fetch email started')
         const senderEmails = await fetchEmails()
         recepients = senderEmails;
         console.log('sender Emails',senderEmails);
         console.log('fetch email end')

         console.log('combined sheet started')
        const filePath = await generateCombinedSheet();
        await sendEmailWithAttachment(filePath);
        console.log('combined sheet end with sending email')
       
        console.log('generate summary report started')
        const savedFilePath = await generateSummaryReport();
        console.log('generate summary report end')

      console.log('send summary report started');
        await sendSummaryReport(savedFilePath, recepients);
        console.log('message snet to all associates')
    
        res.status(200).json({ message: 'file fetched and saved successfully!' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
      }
}

module.exports = { autoProcessReports };