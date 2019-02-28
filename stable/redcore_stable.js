const electron = require('electron')

const {app, document, mainWindow, ipcMain, BrowserWindow, setTitle, title} = require('electron')

  let win

const {dialog} = require('electron')

const { } = require('electron')

const {Menu, shell} = require('electron')


const API_KEYS = require('./keys');
const API_URLS = {
  TMDB: 'https://api.themoviedb.org/3',
  ODB: 'https://api.odb.to',
  TORRENT: 'http://api.apiumando.info/movie?cb=&quality=720p,1080p,3d&page=1'
};


let template = [{
  label: 'Stuff',
  submenu: [{
    label: 'Check for Update',
    click: () => {
      shell.openExternal('https://github.com/Patricks-Corner/Redhedge/releases/latest')
    }
}, {
    label: 'Server Status',
    click: () => {
      shell.openExternal('https://status.duckforceone.gq/')
    }
  }, {
    label: 'About',
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        const options = {
          type: 'info',
          title: 'About Redhedge',
          buttons: ['OK'],
          message: 'Redhedge Erratic Elf - alpha\n Author: Team Patricks-Corner (duckforceone)\n Used Libraries:\n Electron (https://electronjs.org)\n Node.js (https://nodejs.org/en/)\n \nInspired by: \nKodi (https://github.com/xbmc/xbmc)\nStreamBox (https://github.com/RedDuckss/StreamBox)\n  \n APIs used: \n ODB Movie Link Finder for the direct search (https://odb.to) \n Videospider for the IMDb search (https://videospider.in) \n scr.cr for the search (https://scr.cr/) \n'


        }
        dialog.showMessageBox(focusedWindow, options, function () {})
      }
    }
  }


 ]

}, {
  label: 'View',
  submenu: [{

    label: 'Toggle Full Screen',
    accelerator: (() => {
      if (process.platform === 'darwin') {
        return 'Ctrl+Command+F'
      } else {
        return 'F11'
      }
    })(),
    click: (item, focusedWindow) => {
      if (focusedWindow) {
        focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
      }
    }
  }, {
    type: 'separator'
  }, {
    label: 'Contributors',
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        const options = {
          type: 'info',
          title: 'Contributors',
          buttons: ['Ok'],
          message: 'Main Developer: duckforceone'
        }
        dialog.showMessageBox(focusedWindow, options, function () {})
      }
    }

}]
}]
function addUpdateMenuItems (items, position) {
  if (process.mas) return
require('update-electron-app')({
  repo: 'sineflex/Exosphere',
  updateInterval: '5 minutes'
})
  const version = app.getVersion()
  let updateItems = [{
    label: `Version ${version}`,
    enabled: false
  }, {
    label: 'Checking for Update',
    enabled: false,
    key: 'checkingForUpdate'
  }, {
    label: 'Check for Update',
    visible: false,
    key: 'checkForUpdate',
    click: () => {
      require('electron').autoUpdater.checkForUpdates()
    }
  }, {
    label: 'Restart and Install Update',
    enabled: true,
    visible: false,
    key: 'restartToUpdate',
    click: () => {
      require('electron').autoUpdater.quitAndInstall()
    }
  }]

  items.splice.apply(items, [position, 0].concat(updateItems))
}

function findReopenMenuItem () {
  const menu = Menu.getApplicationMenu()
  if (!menu) return

  let reopenMenuItem
  menu.items.forEach(item => {
    if (item.submenu) {
      item.submenu.items.forEach(item => {
        if (item.key === 'reopenMenuItem') {
          reopenMenuItem = item
        }
      })
    }
  })
  return reopenMenuItem
}

if (process.platform === 'darwin') {
  const name = app.getName()
  template.unshift({
    label: name,
    submenu: [{
      label: `About ${name}`,
      role: 'about'
    }, {
      type: 'separator'
    }, {
      label: 'Services',
      role: 'services',
      submenu: []
    }, {
      type: 'separator'
    }, {
      label: `Hide ${name}`,
      accelerator: 'Command+H',
      role: 'hide'
    }, {
      label: 'Hide Others',
      accelerator: 'Command+Alt+H',
      role: 'hideothers'
    }, {
      label: 'Show All',
      role: 'unhide'
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      accelerator: 'Command+Q',
      click: () => {
        app.quit()
      }
    }]
  })

  // Window menu.
  template[3].submenu.push({
    type: 'separator'
  }, {
    label: 'Bring All to Front',
    role: 'front'
  })

  addUpdateMenuItems(template[0].submenu, 1)
}

if (process.platform === 'win32') {
  const helpMenu = template[template.length - 1].submenu
  addUpdateMenuItems(helpMenu, 0)
}

app.on('ready', () => {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
})

app.on('browser-window-created', () => {
  let reopenMenuItem = findReopenMenuItem()
  if (reopenMenuItem) reopenMenuItem.enabled = false
})

app.on('window-all-closed', () => {
  let reopenMenuItem = findReopenMenuItem()
  if (reopenMenuItem) reopenMenuItem.enabled = true
})




  function createWindow () {
    // Erstellen des Browser-Fensters.
   var win = new BrowserWindow({
   	width: 1660,
   	height: 900,
    title: 'Redhedge Erratic Elf - v0.0.1-alpha Patreon Preview'
   });
win.on('page-title-updated', (evt) => {
  evt.preventDefault();
});

    win.loadFile('./beta.html')

    win.on('closed', () => {
 
      win = null
    })
  }

  app.on('ready', createWindow)

  app.on('window-all-closed', () => {

    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {

    if (win === null) {
      createWindow()
    }
  })
ipcMain.on('open-file-dialog', (event) => {
  dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory']
  }, (files) => {
    if (files) {
      event.sender.send('selected-directory', files)
    }
  })
})
ipcMain.on('ready', async event => {
  const response = await got(`${API_URLS.TMDB}/movie/now_playing?api_key=${pickRand(API_KEYS.TMDB)}`);
  const movies = JSON.parse(response.body);

  event.sender.send('media-list', movies);
});

ipcMain.on('search-media', async (event, search) => {
  const query = search.query;
  const page = (search.page ? search.page : 1);
  const response = await got(`${API_URLS.TMDB}/search/movie?query=${query}&page=${page}&api_key=${pickRand(API_KEYS.TMDB)}`);
  const movies = JSON.parse(response.body);

  event.sender.send('media-list', movies);
});