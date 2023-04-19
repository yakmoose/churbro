const pushOptions = {
  applicationServerKey: urlBase64ToUint8Array(window.applicationServerKey),
  userVisibleOnly: true,
};

async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js?v=1');
    console.log('Service worker successfully registered.');
    return registration;
  } catch (e) {
    console.error('Unable to register service worker.', err);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
  .replace(/\-/g, '+')
  .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function ask() {
  return new Promise(function(resolve, reject) {
    const permissionResult = Notification.requestPermission(function(result) {
      resolve(result);
    });
    if (permissionResult) {
      permissionResult.then(resolve, reject);
    }
  });
}

function supportsPushNotifications() {
  if (!('serviceWorker' in navigator)) {
    return false;
  }
  if (!('PushManager' in window)) {
    return false;
  }
  return true;
}

async function init() {
  if (supportsPushNotifications()) {
    return registerServiceWorker();
  }
}

async function subscribe(sw, email) {
  const isPushGranted = await ask();
  console.log(`push: ${isPushGranted}`)
  if (isPushGranted !== 'granted') {
    return
  }

  const subscription = await sw.pushManager.subscribe(pushOptions);

  const response = await fetch('/register', {
    body: JSON.stringify({
      subscription,
      email
    }),
    method: 'POST',
  });
  const data = await response.json()
  console.log(data);
}

async function publish(){
  const response = await fetch('/publish', {
    body: JSON.stringify({}),
    method: 'POST',
  });

  const data = await response.json()
  console.log(data);
}


init().then((sw) => {
  if (!sw){
    return
  }

  const subButton = document.querySelector('.like');
  subButton.disabled = false;

  subButton.addEventListener('click', async () => {
      await subscribe(sw);
      const isPushGranted = await sw.pushManager.permissionState(pushOptions);
      console.log(`push: ${isPushGranted}`)

    if (isPushGranted !== 'granted') {
        return
      }
    console.log('kaboom!')
    await publish(sw)
  });


}).catch((e) => console.log(e));
