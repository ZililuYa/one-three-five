import { app, BrowserWindow, Menu, ipcMain, Tray } from 'electron'
import path from 'path';
// let huobi = require('./huobi/demo_crawler')
// import './huobi/demo_crawler'

// console.log(crawler)

// ipcFun(ipcMain)

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow() {

  ipcMain.on('min', e => mainWindow.minimize());
  ipcMain.on('max', e => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  });
  ipcMain.on('close', e => mainWindow.close());

  /**
   * Initial window options
   */
  // Menu.setApplicationMenu(null) // 删除菜单
  mainWindow = new BrowserWindow({
    minHeight: 563,
    height: 563,
    minWidth: 1000,
    width: 1000,
    useContentSize: true,
    transparent: false,
    frame: false
  })
  mainWindow.setMenu(null)
  mainWindow.loadURL(winURL)


  setTray(mainWindow)
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */

let appTray

function setTray(win) {
  var trayMenuTemplate = [
    {
      label: '退出',
      click: function () {
        //ipc.send('close-main-window');
        win.destroy()
      }
    }
  ];

  //系统托盘图标目录
  // console.log(path.join(__dirname, '../../build/icons/icon.ico'));
  // console.log(path.join(trayIcon, 'icon.ico'))
  // trayIcon = path.join(__dirname, '../../build/icons');

  appTray = new Tray(path.join(__dirname, '../../build/icons/icon.ico'));

  //图标的上下文菜单
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);

  //设置此托盘图标的悬停提示内容
  appTray.setToolTip('HuoBi助手');

  //设置此图标的上下文菜单
  appTray.setContextMenu(contextMenu);
  appTray.on('click', () => { //我们这里模拟桌面程序点击通知区图标实现打开关闭应用的功能
    win.isVisible() ? win.hide() : win.show()
    win.isVisible() ? win.setSkipTaskbar(false) : win.setSkipTaskbar(true);
  })

  newNews(appTray)

  win.on('close', (event) => {
    win.hide();
    win.setSkipTaskbar(true);
    event.preventDefault();
  })

  win.on('closed', () => {
    win = null
  })
  win.on('show', () => {
    appTray.setHighlightMode('always')
  })
  win.on('hide', () => {
    appTray.setHighlightMode('never')
  })

}

let timer

function newNews(appTray) {
  let count = true
  timer = setInterval(function () {
    count = !count
    if (count) {
      appTray.setImage(path.join(__dirname, '../../build/icons/icon.ico'))
    } else {
      appTray.setImage(path.join(__dirname, '../../build/icons/icon1.ico'))
    }
  }, 500)
}

function closeNews(appTray) {
  clearInterval(timer)
  appTray.setImage(path.join(__dirname, '../../build/icons/icon.ico'))
}