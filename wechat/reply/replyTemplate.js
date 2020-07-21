/**
 * 回复用户信息模板
 */
module.exports = options => {
	// 初始化模板
	let replyMessage = `<xml>
    <ToUserName><![CDATA[${options.FromUserName}]]></ToUserName>
    <FromUserName><![CDATA[${options.ToUserName}]]></FromUserName>
    <CreateTime>${Date.now()}</CreateTime>
    <MsgType><![CDATA[${options.msgType}]]></MsgType>`

	// 文本
	if (options.msgType === 'text') {
		replyMessage += `
    <Content><![CDATA[${options.content}]]></Content>`
	}
	// 图片
	else if (options.msgType === 'image') {
		replyMessage += `
    <Image>
      <MediaId><![CDATA[${options.media_id}]]></MediaId>
    </Image>`
	}
	// 语音
	else if (options.msgType === 'voice') {
		replyMessage += `
    <Voice>
      <MediaId><![CDATA[${options.media_id}]]></MediaId>
    </Voice>`
	}
	// 视频
	else if (options.msgType === 'video') {
		replyMessage += `
    <Voice>
      <MediaId><![CDATA[${options.media_id}]]></MediaId>
      <Title><![CDATA[${options.title}]]></Title>
      <Description><![CDATA[${options.description}]]></Description>
    </Voice>`
	}
	// 音乐
	else if (options.msgType === 'music') {
		replyMessage += `
    <Music>
      <Title><![CDATA[${options.title}]]></Title>
      <Description><![CDATA[${options.DESCRIPTION}]]></Description>
      <MusicUrl><![CDATA[${options.MUSIC_Url}]]></MusicUrl>
      <HQMusicUrl><![CDATA[${options.HQ_MUSIC_Url}]]></HQMusicUrl>
      <ThumbMediaId><![CDATA[${options.media_id}]]></ThumbMediaId>
    </Music>`
	}
	// 图文
	else if (options.msgType === 'news') {
		replyMessage += `
    <ArticleCount>${options.content.length}</ArticleCount>
		<Articles>`

		options.content.forEach(item => {
			replyMessage += `      
      <item>
        <Title><![CDATA[${item.movieName.trim()}]]></Title>
        <Description><![CDATA[${item.introduction.trim()}]]></Description>
        <PicUrl><![CDATA[https://image.suning.cn/uimg/ZR/share_order/159516085124083317.jpg}]]></PicUrl>
        <Url><![CDATA[${item.href.trim()}]]></Url>
      </item>`
		})
		replyMessage += `</Articles>`
	}

	replyMessage += '</xml>'
	return replyMessage
}
