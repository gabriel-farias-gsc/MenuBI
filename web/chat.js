let webChatInstance = null;
let directLineUrl = 'https://unitedstates.directline.botframework.com/v3/directline';

const tokenEndpoint =
  'https://defaultc7487fcefe35443d882a01e5d596f0.0c.environment.api.powerplatform.com' +
  '/copilotstudio/agenticruntime/botsbyschema/crf5e_agenteradar_hPS4vZ/directline/token?api-version=2022-03-01-preview';

const styleOptions = {
  accent: '#0078D4',
  autoScrollSnapOnPage: true,
  autoScrollSnapOnPageOffset: 0,
  avatarBorderRadius: '7%',
  avatarSize: 31,
  backgroundColor: '#e8e9eb',
  botAvatarBackgroundColor: '#ffffff00',
  botAvatarImage: '../assets/agent-logo.png',
  botAvatarInitials: 'B',
  bubbleAttachmentMaxWidth: 480,
  bubbleAttachmentMinWidth: 250,
  bubbleBackground: '#f0eded',
  bubbleBorderColor: '#f5f5f5',
  bubbleBorderRadius: 41,
  bubbleBorderStyle: 'solid',
  bubbleBorderWidth: 1,
  bubbleFromUserBackground: '#ebefff',
  bubbleFromUserBorderColor: '#f5f5f5',
  bubbleFromUserBorderRadius: 41,
  bubbleFromUserBorderStyle: 'solid',
  bubbleFromUserBorderWidth: 1,
  bubbleFromUserNubOffset: 0,
  bubbleFromUserNubSize: 0,
  bubbleFromUserTextColor: '#242424',
  bubbleImageHeight: 10,
  bubbleImageMaxHeight: 240,
  bubbleImageMinHeight: 240,
  bubbleMessageMaxWidth: 480,
  bubbleMessageMinWidth: 120,
  bubbleMinHeight: 50,
  bubbleNubOffset: 0,
  bubbleTextColor: '#242424',
  emojiSet: true,
  fontSizeSmall: '70%',
  hideUploadButton: false,
  messageActivityWordBreak: 'break-word',
  monospaceFont: 'Consolas',
  paddingRegular: 10,
  paddingWide: 10,
  primaryFont: null,
  sendBoxBackground: '#e8e9eb',
  sendBoxBorderTop: 'solid 1px #808080',
  sendBoxButtonColor: '#0078d4',
  sendBoxButtonColorOnHover: '#006cbe',
  sendBoxButtonShadeBorderRadius: 40,
  sendBoxButtonShadeColorOnHover: '',
  sendBoxHeight: 60,
  sendBoxPlaceholderColor: '#171616',
  sendBoxTextColor: '#2e2d2d',
  showAvatarInGroup: 'status',
  spinnerAnimationHeight: 16,
  spinnerAnimationPadding: 12,
  spinnerAnimationWidth: 16,
  subtleColor: '#000000FF',
  suggestedActionBackgroundColor: '#006FC4FF',
  suggestedActionBackgroundColorOnHover: '#0078D4',
  suggestedActionBorderColor: '',
  suggestedActionBorderRadius: 10,
  suggestedActionBorderWidth: 1,
  suggestedActionLayout: 'flow',
  suggestedActionTextColor: '#FFFFFFFF',
  typingAnimationBackgroundImage:
    "url('https://wpamelia.com/wp-content/uploads/2018/11/ezgif-2-6d0b072c3d3f.gif')",
  typingAnimationDuration: 5000,
  typingAnimationHeight: 20,
  typingAnimationWidth: 64,
  userAvatarBackgroundColor: '#222222',
  userAvatarInitials: 'U',
};
const backgroundImage = '';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  root.style.setProperty('--primary-color', createGradient(styleOptions.accent));
  root.style.setProperty('--header-textColor', styleOptions.suggestedActionTextColor);

  if (backgroundImage) {
    const webchatElement = document.getElementById('webchat');
    webchatElement.style.backgroundImage = `url(${backgroundImage})`;
    webchatElement.style.backgroundSize = 'cover';
    webchatElement.style.backgroundPosition = 'center';
    webchatElement.style.backgroundRepeat = 'no-repeat';

    const overlay = document.createElement('div');
    overlay.className = 'webchat-overlay';
    webchatElement.appendChild(overlay);
  }
});

function createGradient(baseColor) {
  const r = parseInt(baseColor.slice(1, 3), 16);
  const g = parseInt(baseColor.slice(3, 5), 16);
  const b = parseInt(baseColor.slice(5, 7), 16);
  const lighterColor = `#${Math.min(255, r + 30)
    .toString(16)
    .padStart(2, '0')}${Math.min(255, g + 30)
    .toString(16)
    .padStart(2, '0')}${Math.min(255, b + 30)
    .toString(16)
    .padStart(2, '0')}`;
  const darkerColor = `#${Math.max(0, r - 30)
    .toString(16)
    .padStart(2, '0')}${Math.max(0, g - 30)
    .toString(16)
    .padStart(2, '0')}${Math.max(0, b - 30)
    .toString(16)
    .padStart(2, '0')}`;
  return `linear-gradient(135deg, ${lighterColor}, ${baseColor}, ${darkerColor})`;
}

function showChat() {
  const popup = document.getElementById('chatbot-popup');
  const openButton = document.getElementById('open-chat');
  popup.classList.add('visible');
  openButton.classList.add('hidden');
}

function hideChat() {
  const popup = document.getElementById('chatbot-popup');
  const openButton = document.getElementById('open-chat');
  popup.classList.remove('visible');
  openButton.classList.remove('hidden');
}

function createCustomStore() {
  return window.WebChat.createStore({}, ({ dispatch }) => (next) => (action) => {
    if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
      dispatch({
        type: 'DIRECT_LINE/POST_ACTIVITY',
        meta: { method: 'keyboard' },
        payload: {
          activity: {
            channelData: { postBack: true },
            name: 'startConversation',
            type: 'event',
          },
        },
      });
    }
    return next(action);
  });
}

async function restartConversation() {
  try {
    if (!directLineUrl) {
      console.error('DirectLine URL not initialized');
      return;
    }

    const response = await fetch(tokenEndpoint);
    const conversationInfo = await response.json();

    if (!conversationInfo.token) {
      throw new Error('Failed to get conversation token');
    }

    const newDirectLine = window.WebChat.createDirectLine({
      domain: `${directLineUrl}v3/directline`,
      token: conversationInfo.token,
    });

    const webchatElement = document.getElementById('webchat');
    webChatInstance = window.WebChat.renderWebChat(
      {
        directLine: newDirectLine,
        styleOptions,
        store: createCustomStore(),
      },
      webchatElement
    );
  } catch (err) {
    console.error('Failed to restart conversation:', err);
  }
}

async function initializeChat() {
  try {
    const conversationResponse = await fetch(tokenEndpoint);

    const conversationInfo = await conversationResponse.json();

    if (!conversationInfo.token) {
      throw new Error('Failed to get conversation token');
    }

    const directLine = window.WebChat.createDirectLine({
      token: conversationInfo.token,
    });

    window.WebChat.renderWebChat(
      {
        directLine,
        styleOptions,
        store: createCustomStore(),
      },
      document.getElementById('webchat')
    );
  } catch (err) {
    console.error('Failed to initialize chat:', err);
  }
}

initializeChat();

const modal = document.getElementById('agent-modal');

document.getElementById('openAgent').addEventListener('click', () => {
  modal.style.display = 'flex';
});

document.getElementById('closeChat').addEventListener('click', () => {
  modal.style.display = 'none';
});
