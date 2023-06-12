import axios from "axios";
import { getTokens } from "../utils/tokenizer";

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
import { originIsAllowed, FIRST_PART_PROMPT } from "../utils/chatUtils";

const chatWebsocket = (request: any) => {
  {
    if (!originIsAllowed(request.origin)) {
      // Sólo se aceptan request de origenes permitidos
      request.reject();
      console.log(
        new Date() + " Conexión del origen " + request.origin + " rechazada."
      );
      return;
    }
    const connection = request.accept(null, request.origin);
    connection.on("message", async (message: any) => {
      let tokenCount = 0;
      const stringMessage = JSON.parse(message.utf8Data);

      const cleanMessages = stringMessage.messages.map(
        (elementMessage: any) => {
          const tokens = getTokens(elementMessage.content);
          tokenCount += tokens;

          return { role: elementMessage.role, content: elementMessage.content };
        }
      );

      if (cleanMessages.length > 4) {
        connection.send(
          JSON.stringify({
            status: "error",
            content: "Limite de mensajes alcanzado",
          })
        );
        return;
      }

      const moderationRes = await axios({
        method: "POST",
        url: "https://api.openai.com/v1/moderations",
        data: JSON.stringify({
          input: cleanMessages[cleanMessages.length - 1].content,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      });

      const moderationData: any = moderationRes.data;
      const [results] = moderationData.results;

      if (results.flagged) {
        connection.send(
          JSON.stringify({
            status: "error",
            content: "Se detectaron mensajes inapropidados por openai",
          })
        );
        return;
      }

      const prompt = FIRST_PART_PROMPT;
      tokenCount += getTokens(prompt);

      if (tokenCount >= 4000) {
        connection.send(
          JSON.stringify({ status: "error", content: "Query demaciado larga" })
        );
        return;
      }

      const messages = [
        { role: "system", content: FIRST_PART_PROMPT },
        ...cleanMessages,
      ];

      const chatRequestOpts = {
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.6,
        stream: true,
      };

      try {
        const res = await openai.createChatCompletion(chatRequestOpts, {
          responseType: "stream",
        });

        res.data.on("data", (data: any) => {
          const lines = data
            .toString()
            .split("\n")
            .filter((line: any) => line.trim() !== "");
          for (const line of lines) {
            const message = line.replace(/^data: /, "");
            if (message === "[DONE]") {
              connection.send(JSON.stringify({ status: "done", content: "" })); // Stream finished
              return;
            }
            try {
              const parsed = JSON.parse(message);
              const responseChat = parsed.choices[0].delta.content;
              if (responseChat) {
                connection.send(
                  JSON.stringify({ status: "thinking", content: responseChat })
                );
              }
            } catch (error) {
              connection.send(
                JSON.stringify({
                  status: "error",
                  content: "Could not JSON parse stream message",
                })
              );
            }
          }
        });
      } catch (error: any) {
        if (error.response?.status) {
          console.error(error.response.status, error.message);
          error.response.data.on("data", (data: any) => {
            const message = data.toString();
            try {
              const parsed = JSON.parse(message);

              JSON.stringify({
                status: "error",
                content: "An error occurred during OpenAI request: ",
                parsed,
              });
            } catch (error) {
              JSON.stringify({
                status: "error",
                content: "An error occurred during OpenAI request: ",
                message,
              });
            }
          });
        } else {
          JSON.stringify({
            status: "error",
            content: "An error occurred during OpenAI request",
            error,
          });
        }
      }
    });
    connection.on("close", (reasonCode: any, description: any) => {
      console.log("El cliente se desconecto");
    });
  }
};
export default chatWebsocket;
