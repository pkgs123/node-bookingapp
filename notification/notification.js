const { CommunicationIdentityClient } = require('@azure/communication-identity');
// const { SmsClient } = require('@azure/communication-sms');
const { EmailClient } = require('@azure/communication-email');


const connectionString = 'endpoint=https://prashantemailservice.unitedstates.communication.azure.com/;accesskey=U0zzgJ7S/jx0XCQj8jmRWiQfUJZLAaiS+6TCe1Uvo0ZQED3tTOcd0sj7t4LnxmNs7WsVRN55SNIJuFjVSXn6Aw==';
const communicationIdentityClient = new CommunicationIdentityClient(connectionString);


const emailClient = new EmailClient(connectionString);

async function sendEmail(recipientsAddress,recipientDisplayName,customMsg) {
  try {
    // const email = {
    //   from: 'DoNotReply@9070fa46-165c-44f5-ba84-83d4dfe33972.azurecomm.net',
    //   to: ['singh.giri545@gmail.com'],
    //   subject: 'Test Email',
    //   content: {
    //     type: 'text/html',
    //     value: '<h1>Hello, this is a test email!</h1>'
    //   }
    // };
    const message = {
        senderAddress: "DoNotReply@9070fa46-165c-44f5-ba84-83d4dfe33972.azurecomm.net",
        content: {
          subject: "Appointment Status-Confirmed",
          plainText: customMsg,
        },
        recipients: {
          to: [
            {
              address: recipientsAddress[0],
              displayName: recipientDisplayName[0],
            },
            {
                address: recipientsAddress[1],
                displayName: recipientDisplayName[1],
              }
          ]
        //   cc: [
        //     {
        //         address: recipientsAddress[0],
        //         displayName: recipientDisplayName[0],
        //       },
        //       {
        //           address: recipientsAddress[1],
        //           displayName: recipientDisplayName[1],
        //         }
        //   ],
        //   bcc: [
        //     {
        //         address: recipientsAddress[0],
        //         displayName: recipientDisplayName[0],
        //       },
        //       {
        //           address: recipientsAddress[1],
        //           displayName: recipientDisplayName[1],
        //         }
        //   ],
        },
      };
      
      const poller = await emailClient.beginSend(message);
      const response = await poller.pollUntilDone();

      console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    return error;
  }
}

module.exports = {
    sendEmail
}
