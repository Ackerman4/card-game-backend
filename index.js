import Enmap from 'enmap';
import express from 'express';
import axios from 'axios'; // Use axios to fetch real-time conversion data

const app = express();
const port = 3443;

// Initialize Enmap
const nftPrice = new Enmap({ name: 'nftPrice' });

const webhookUrl = 'https://discord.com/api/webhooks/1306964796234797086/L4MFm-bn-L61nebZ8TwqL15f9apqRu9kHS-c3y7JPIrUtN9Ek3uEPcnjWKfkZt6PIAZw';

// Function to send a message and embed to a Discord webhook

// Create a sample embed

// Sending a message with an embed

// Function to update the price in Enmap every 10 minutes
async function updatePrice() {
    try {
        const price = await getPhpToSolAmount(50); // Get price in SOL
        await nftPrice.set("nft-price", {
            data: price,
            lastUpdate: new Date(),
        });
        const embedMessage = {
            title: "Price Updated!",
            url: "https://www.coingecko.com/en/coins/solana/php",
            description: `**__Date Fetched:__**\n> \`${formatDate(new Date())}\``, // Use formatted date here
            color: 11003857, // Hexadecimal color (in decimal format)
            fields: [
                {
                    name: "PHP",
                    value: `\`\`\`css\n50\`\`\``,
                    inline: true
                },
                {
                    name: "SOL",
                    value: `\`\`\`css\n${price}\`\`\``,
                    inline: true
                }
            ],
            thumbnail: {
                url: "https://s.cafebazaar.ir/images/icons/com.coingecko.coingeckoapp-a60e464c-905b-4590-94d8-fb05f06021d2_512x512.png?x-img=v1/resize,h_256,w_256,lossless_false/optimize" // Add the thumbnail URL here
            },
            image: {
                url: "https://i.imgur.com/ZXvXk1F.png"
            },
            footer: {
                text: "ESS Back-end Server"
            },
            timestamp: new Date().toISOString() // Current time
        };
        sendDiscordWebhook(embedMessage);
    } catch (error) {
        console.error('Error updating price:', error);
    }
}

// Function to get PHP to SOL conversion amount
async function getPhpToSolAmount(phpAmount) {
    try {
        // CoinGecko API endpoint for current prices
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: 'solana', // The id of the cryptocurrency (Solana)
                vs_currencies: 'php' // The currency to convert to (PHP)
            }
        });

        // Extract the price of SOL in PHP from the response
        const solPriceInPhp = response.data.solana.php;

        // Calculate the amount of SOL for the given PHP amount
        const solAmount = phpAmount / solPriceInPhp;

        return solAmount; // Return the amount of SOL
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        throw error; // Rethrow the error to be caught in updatePrice
    }
}
// Update price immediately and then every 10 minutes
updatePrice();
setInterval(updatePrice, 600000); // 10 minutes

// Example route to retrieve the latest data
app.get('/nft-price', (req, res) => {
    const data = nftPrice.get("nft-price");
    console.log('NFT Price Data:', data); 
    res.json(data || {}); // Return empty object if no data
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

async function sendDiscordWebhook(embed) {
    try {
        const payload = {
            embeds: [embed] // The embed content (optional)
        };

        const response = await axios.post(webhookUrl, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Message sent successfully:', response.data);
    } catch (error) {
        console.error('Error sending message to Discord:', error);
    }
}

function formatDate(date) {
    const options = {
        timeZone: 'Asia/Manila', // Set to Philippine Time
        year: 'numeric',
        month: 'long', // Full month name
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true // Enable 12-hour format with AM/PM
    };

    return date.toLocaleString('en-US', options); // Format date in the desired style
}