
const AI = (() => {

    const API_URL = '';

    async function ask(message) {

        try {

            const response = await fetch(API_URL,{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    message
                })
            });

            const data = await response.json();

            return data.reply || '';

        } catch(error) {

            console.error('AI Error:', error);

            return 'Lo siento, ocurrió un error.';
        }
    }

    return {
        ask
    };

})();
