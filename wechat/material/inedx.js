/*
  素材管理
*/
const WeChat = require('../wetChat.js')

const w = new WeChat()

// 暂时素材管理
async function temporary() {
	// 上传 图片
	// const res1 = await w.uploadMaterial('image', '01.png', null, false)
	// console.log(res1)
	// 上传 缩略图
	// const res2 = await w.uploadMaterial('thumb', 'thumb.png', null, false)
	// console.log(res2)
	// 上传 视屏
	// const res3 = await w.uploadMaterial('video', 'movie.mp4', null, false)
	// console.log(res3)
	//
	// const res4 = await w.getTemporaryMaterial('image', res1.media_id, '_01.png')
	// console.log(res4)  图片下载到指定的目录下
	// const res5 = await w.getTemporaryMaterial('thumb', res2.media_id, '_thumb.png')
	// console.log(res5)  缩略图下载到指定的目录下
	// const res6 = await w.getTemporaryMaterial('video', res3.media_id, '_movie.mp4')
	// console.log(res6) 获取视屏下载地址
}
// temporary()

// 永久素材管理
// pergmanet()
async function pergmanet() {
	// 3.上传 视屏
	let opt = {
		title: 'VIDEO_TITLE',
		introduction: 'INTRODUCTION'
	}
	// const res3 = await w.uploadPermanentMaterial('video', 'movie.mp4', opt)
	// console.log(res3)

	// 1.上传永久图片素材
	const { url } = await w.uploadPermanentMaterial('pic', '01.png')
	// 2.上传永久图片缩略图素材
	const { media_id } = await w.uploadPermanentMaterial('thumb', '01.png')
	// 3.上传永久图文素材
	let source = {
		articles: [
			{
				title: '个人博客',
				thumb_media_id: media_id,
				author: '张源',
				digest:
					'图文消息的摘要，仅有单图文消息才有摘要，多图文此处为空。如果本字段为没有填写，则默认抓取正文前64个字。',
				show_cover_pic: 1,
				content: `<!DOCTYPE html>
				<html lang="en">
					<head>
						<meta charset="UTF-8" />
						<meta name="viewport" content="width=device-width, initial-scale=1.0" />
						<title>Document</title>
					</head>
					<body>
						<h1>个人博客</h1>
						<p>
							Vue (读音 /vjuː/，类似于 view) 是一套用于构建用户界面的渐进式框架。与其它大型框架不同的是，Vue
							被设计为可以自底向上逐层应用。Vue
							的核心库只关注视图层，不仅易于上手，还便于与第三方库或既有项目整合。另一方面，当与现代化的工具链以及各种支持类库结合使用时，Vue
							也完全能够为复杂的单页应用提供驱动。
						</p>
						<br />
						<p>如果你想在深入学习 Vue 之前对它有更多了解，我们制作了一个视频，带您了解其核心概念和一个示例工程。</p>
						<br />
						<p>如果你已经是有经验的前端开发者，想知道 Vue 与其它库/框架有哪些区别，请查看对比其它框架。</p>
						<br /><br />
						<h3>
							尝试 Vue.js 最简单的方法是使用 Hello World
							例子。你可以在浏览器新标签页中打开它，跟着例子学习一些基础用法。或者你也可以创建一个 .html
							文件，然后通过如下方式引入 Vue：
						</h3>
					</body>
				</html>
				`,
				content_source_url: 'https://cn.vuejs.org/v2/guide/'
			}
			//若新增的是多图文素材，则此处应还有几段articles结构
		]
	}
	const res = await w.uploadPermanentMaterial('news', source)

	// 1.下载永久图文素材
	const res2 = await w.getPermanentMaterial('news', res.media_id)
	console.log(res2) // 能获取URL

	// 2.下载素材
	const res4 = await w.getPermanentMaterial('image', res1.media_id, '_01.png')
	console.log(res4) // 图片下载到指定的目录下
	const res5 = await w.getPermanentMaterial('thumb', res2.media_id, '_thumb.png')
	console.log(res5) // 缩略图下载到指定的目录下
	const res6 = await w.getPermanentMaterial('video', res3.media_id, '_movie.mp4')
	console.log(res6) // 获取视屏下载地址
}
