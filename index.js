document.addEventListener('DOMContentLoaded', () => {
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    const messagesDiv = document.getElementById('messages');
    const errorDiv = document.getElementById('error');
    const showMoreButton = document.getElementById('showMoreButton');
    let replyingTo = null; 
    let currentPage = 1;
    const limit = 15;

    const apiUrl = 'https://an-ch.syho.site/api/messages';
    const censoredWords = ['.com', '.net', '.me']; 

    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: 'numeric', 
            second: 'numeric' 
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const loadMessages = async (page = 1, append = false) => {
        try {
            const response = await fetch(`${apiUrl}?page=${page}&limit=${limit}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const messages = await response.json();
            const newMessages = messages.map(msg => `
                <div class="mt-4 p-4 rounded-lg" style="color: #E2EAFD; background: #15181e; border-color: rgb(32, 36, 45); border-width: 1px;">
                    <div class="font-bold py-1">
                        ${msg.replyingTo ? `<p style="background: #111318; border-color: rgb(32, 36, 45); border-width: 1px;" class="px-3 py-3 mb-4 rounded-xl">${msg.replyingTo}</p>` : ''}
                        ${msg.message} 
                        <br><span class="text-xs text-gray-500">by anonymous ${formatDate(msg.created_at)}</span>
                    </div>
                    <button class="reply-button text-xs text-gray-500" data-message="${msg.message}">Reply</button>
                </div>
            `).join('');
            if (append) {
                messagesDiv.innerHTML += newMessages;
            } else {
                messagesDiv.innerHTML = newMessages;
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    loadMessages();

    const checkCensoredWords = (message) => {
        return new Promise((resolve, reject) => {
            const containsCensoredWord = censoredWords.some(word => message.toLowerCase().includes(word.toLowerCase()));
            if (containsCensoredWord) {
                reject('Sorry, your message contains inappropriate content.');
            } else {
                resolve();
            }
        });
    };

    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let message = messageInput.value;

        try {
            await checkCensoredWords(message);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, replyingTo })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            messageInput.value = '';
            replyingTo = null;
            messageInput.placeholder = 'Whats on your mind?';
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
            loadMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            errorDiv.textContent = error;
            errorDiv.style.display = 'block';
        }
    });

    messagesDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('reply-button')) {
            replyingTo = e.target.dataset.message;
            messageInput.focus();
            messageInput.placeholder = `Replying to: "${replyingTo}"`;
        }
    });


    showMoreButton.addEventListener('click', () => {
        currentPage++;
        loadMessages(currentPage, true);
    });
});
