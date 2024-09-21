export async function gaianet_ai_request(prompt, url) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
        },
        // body: '{"messages":[{"role":"system", "content": "You are a helpful assistant."}, {"role":"user", "content": "Where is Paris?"}]}',
        body: JSON.stringify({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
        }),
    });
    const formatted_res = await response.json();
    return (formatted_res.choices[0].message);
}


