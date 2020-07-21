/*
  1、将数据库图片链接，上传到七牛云服务器中。
*/
const sqlQuery = require('../mysql/mysql')
const upload = require('./upload.js')
const { qiniu_img_url } = require('../../config/index')
const { nanoid } = require('nanoid') // 生成唯一key值

const fun = async () => {
	// 1、获取数据库中的图片链接
	const res = await sqlQuery('select img from movieInfo where ISNULL(post_key)')
	for (let index = 0; index < res.length; index++) {
		const element = res[index]
		let imgUrl = element.img // 图片地址

		// 2、上传到七牛中，key值应该唯一
		let key = nanoid(10) + '.jpg' // 唯一key值
		await upload(imgUrl, 'wx2023526001', key)

		// 3、保存key值到数据库中，方便以后调用
		let updataSql = `UPDATE movieInfo SET post_key = '${key}' where img = '${imgUrl}'`
		await sqlQuery(updataSql)
	}
}
module.exports = fun
