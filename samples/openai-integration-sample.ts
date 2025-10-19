/**
 * OpenAI integration sample demonstrating success and error handling.
 *
 * Run with:
 *    npx ts-node samples/openai-integration-sample.ts
 */

import {
  OpenAIIntegration,
  OpenAIIntegrationError,
  ChatMessage,
} from '../src/lib/integrations/OpenAIIntegration';

function createMockedOpenAIIntegration(): OpenAIIntegration {
  const integration = new OpenAIIntegration('sk-mock', {
    baseUrl: 'https://mock.openai.local',
    defaultModel: 'gpt-4o-mini',
  }) as any;

  let callCount = 0;

  integration.client.post = async (_path: string, payload: any) => {
    callCount += 1;

    const messages: ChatMessage[] = payload.messages ?? [];
    const userInput = messages[messages.length - 1]?.content ?? '';

    if (callCount === 1) {
      return {
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
        data: {
          id: 'chatcmpl-mock-success',
          object: 'chat.completion',
          created: Date.now() / 1000,
          model: payload.model,
          choices: [
            {
              index: 0,
              message: { role: 'assistant', content: `Echo: ${userInput}` },
              finish_reason: 'stop',
            },
          ],
        },
      };
    }

    throw {
      isAxiosError: true,
      message: 'Mock validation error',
      response: {
        status: 400,
        data: { error: { message: 'prompt must include a user question' } },
      },
    };
  };

  return integration as OpenAIIntegration;
}

async function run(): Promise<void> {
  const integration = createMockedOpenAIIntegration();

  const success = await integration.createChatCompletion([
    { role: 'user', content: 'Where is my order?' },
  ]);
  console.log('Model reply:', success.choices[0].message.content);

  try {
    await integration.createChatCompletion([{ role: 'user', content: '' }], { temperature: 0.2 });
  } catch (error) {
    if (error instanceof OpenAIIntegrationError) {
      console.error('Handled OpenAI error:', {
        status: error.status,
        message: error.message,
      });
    } else {
      throw error;
    }
  }
}

run().catch(error => {
  console.error('OpenAI sample failed', error);
  process.exitCode = 1;
});
