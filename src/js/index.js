import '../css/app.scss'//引用样式示例
import Icon from '../img/icon.jpg';//引用图片示例
import 'font-awesome/css/font-awesome.min.css'//fa字体图标示例

document.getElementById('app').innerHTML = (`
    <h1><i class="fa fa-diamond"></i> 太棒啦!</h1>
    <img src="${Icon}" alt="icon">
    <p>现在让我开始用webpack脚手架开发我们的页面吧！</p>
    <p class="muted">Let's start our simple-page project with webpack-cli</p>
`);