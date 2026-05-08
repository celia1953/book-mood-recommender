// Importamos el cliente de Bedrock Runtime
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

// Configuramos el cliente en la región donde tienes Bedrock (us-east-1 normalmente)
const client = new BedrockRuntimeClient({ region: "us-east-1" });

// Exportamos la función handler que Lambda va a ejecutar
exports.handler = async (event) => {
  try {
    // Parseamos el body que viene del API Gateway
    const body = typeof event.body === "string" ? JSON.parse(event.body) : (event.body || {});
    const prompt = body.message || "Hola, necesito ayuda";

    // Configuramos la invocación al modelo Mistral
    const command = new InvokeModelCommand({
      modelId: "mistral.mistral-7b-instruct-v0:1", // ID del modelo en Bedrock
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 300,
        temperature: 0.7
      })
    });

    // Enviamos la petición a Bedrock
    const response = await client.send(command);

    // Decodificamos la respuesta (viene como bytes)
    const decoded = JSON.parse(Buffer.from(response.body).toString("utf-8"));

    // Extraemos el texto generado
    const text = decoded?.outputs?.[0]?.text || decoded?.generated_text || "Sin respuesta";

    // Devolvemos la respuesta al API Gateway
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response: text })
    };
  } catch (error) {
    console.error("Error invocando Mistral:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error al invocar Mistral" })
    };
  }
};
