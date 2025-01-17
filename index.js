const Telegram = require('node-telegram-bot-api')
const ENV = require('dotenv').config().parsed
const Bot = new Telegram(ENV.BOT_TOKEN, {polling: true})
const fs = require('fs')

Bot.on('message', async message => {
    const text = message.text
    const chatId = message.chat.id

    if(text === "/start"){
        await Bot.sendMessage(chatId, 
            `AssalomuAleykum, ${message.chat.first_name}, Instagramdan video yoki hikoya linkini yuborsangiz uni yuklab beraman.. `
        )
    }else{
        const json = fetch(`http://localhost:3000/igdl?url=${text}`).then(async response => {
            const en = await response.json()
            if(en.url.status){
                const urlVideo = en.url.data[0].url
                const pathVideo = `api/${chatId}.mp4`
                try {
                    await downloadFile(urlVideo, pathVideo)
                    await Bot.sendDocument(chatId, pathVideo)
                    fs.unlinkSync(pathVideo)
                }
                catch(error){
                    Bot.sendMessage(chatId, "Faylni yuklab bo'lmadi :(")
                }
            }else{
                Bot.sendMessage(chatId, "Noto'g'ri url kiritdingiz. Yoki ushbu videoni yuklab bo'lmaydi")
            }
        })
    }

})

async function downloadFile(url, filePath) {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
}