/*
	1、上传图片资源到七牛服务器中
*/

const qiniu = require('qiniu')
// 1、创建鉴权对象 mac
var accessKey = 'fUgFOc2X1p2qLVXhCb5VKZww6OwAyJ7bgWtGMxAJ'
var secretKey = 'QLL5NcdRgPYiNf4c-MAGBzX4brIPWuywIINvHOFi'
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey)

// 2、资源管理相关的操作首先要构建BucketManager对象：
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
var config = new qiniu.conf.Config()
//config.useHttpsDomain = true;
config.zone = qiniu.zone.Zone_z2 // 华南区域节点
// 3、得到方法 bucketManager就有很多方法
var bucketManager = new qiniu.rs.BucketManager(mac, config)

// var resUrl = 'http://devtools.qiniu.com/qiniu.png' // 网络资源地址
// var bucket = 'wx2023526001' // 存储空间的名称
// var key = 'qiniu.png' // 重命名网络资源名称

module.exports = (resUrl, bucket, key) => {
	/**
	 * @param resUrl 网络资源地址
	 * @param bucket 存储空间的名称
	 * @param key 重命名网络资源名称
	 */
	return new Promise((res, rej) => {
		bucketManager.fetch(resUrl, bucket, key, function (err, respBody, respInfo) {
			if (err) {
				console.log(err)
				rej('上传图片到七牛出问题------------------------')
			} else {
				if (respInfo.statusCode == 200) {
					console.log('图片文件上传成功-------------------')
					res(true)
				}
			}
		})
	})
}
