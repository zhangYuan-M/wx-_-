/*
  自定义菜单模块 模板
*/

// 导入服务器地址
const { host_url } = require('../../config/index')

module.exports = {
	button: [
		{
			name: '🎬至尊电影',
			sub_button: [
				{
					type: 'view',
					name: '👉电影预告',
					url: `${host_url}/previewMovie`
				},
				{
					type: 'view',
					name: '👉美剧',
					url: 'https://91mjw.com'
				}
			]
		},
		{
			name: '📋 菜单',
			sub_button: [
				{
					type: 'view',
					name: '🔎 百度搜索',
					url: 'http://www.baidu.com/'
				},
				{
					type: 'view',
					name: '🎤 语音识别页面',
					url: `${host_url}/search`
				},
				{
					type: 'scancode_waitmsg',
					name: '📁 扫码带提示',
					key: 'rselfmenu_0_0'
				},
				{
					type: 'scancode_push',
					name: '📁 扫码推事件',
					key: 'rselfmenu_0_1'
				}
			]
		},
		{
			name: '📌 戳我',
			sub_button: [
				{
					type: 'click',
					name: '👉 帮助',
					key: 'help'
				},
				{
					type: 'pic_sysphoto',
					name: '📁 系统拍照发图',
					key: 'rselfmenu_1_0'
				},
				{
					type: 'pic_photo_or_album',
					name: '📁 拍照或者相册发图',
					key: 'rselfmenu_1_1'
				},
				{
					type: 'pic_weixin',
					name: '📁 微信相册发图',
					key: 'rselfmenu_1_2'
				}
			]
		}
	]
}
