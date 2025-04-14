document.addEventListener('DOMContentLoaded', function() {
    // 配置常量
    const miniAppRedirectParams = 'depotCode=${depotCode}&deviceCode=${deviceCode}&sign=${sign}';
    const miniAppRedirectUrl = 'alipays://platformapi/startapp?appId=2021002175698278&page=pages/innerCabQuery/index?';

    // 元素绑定
    const generateBtn = document.querySelector('.generate-btn');
    const resultTextarea = document.getElementById('allurl');
    const secretInput = document.getElementById('secret');
    const dataTextarea = document.getElementById('data');

    // 事件监听
    generateBtn.addEventListener('click', getAllUrl);

    // 主逻辑函数
    function getAllUrl() {
        const secret = secretInput.value.trim();
        const data = dataTextarea.value.trim();

        // 输入验证
        if (!validateInputs(secret, data)) return;

        // 处理数据并生成结果
        const lines = data.split('\n')
                          .filter(line => line.trim().length > 0)
                          .map(line => line.split('&').map(item => item.trim()));

        let result = '';
        lines.forEach(([depotCode, deviceCode]) => {
            if (!depotCode) return;
            const url = buildMiniAppRedirectUrl(depotCode, deviceCode || '', secret);
            if (url) result += url + '\n';
        });

        resultTextarea.value = result;
    }

    // 输入验证函数
    function validateInputs(secret, data) {
        if (!secret || !data) {
            alert("秘钥或设备数据不能为空");
            return false;
        }
        if (secret.length !== 19) {
            alert("秘钥格式不正确，必须为19位字符");
            return false;
        }
        return true;
    }

    // URL构建函数
    function buildMiniAppRedirectUrl(depotCode, deviceCode, secret) {
        try {
            // 生成签名
            const rawString = depotCode + deviceCode + secret;
            const sign = CryptoJS.MD5(rawString).toString();

            // 构造参数
            const paramsStr = miniAppRedirectParams
                .replace(/\${depotCode}/g, depotCode)
                .replace(/\${deviceCode}/g, deviceCode)
                .replace(/\${sign}/g, sign);

            // 编码处理
            return miniAppRedirectUrl + javaURLEncode(paramsStr);
        } catch (error) {
            console.error('URL生成失败:', error);
            return null;
        }
    }

    // 自定义URL编码函数
    function javaURLEncode(str) {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(str);
        let encoded = '';
        
        for (const byte of bytes) {
            if (
                (byte >= 0x41 && byte <= 0x5A) || // A-Z
                (byte >= 0x61 && byte <= 0x7A) || // a-z
                (byte >= 0x30 && byte <= 0x39) || // 0-9
                byte === 0x2D || // -
                byte === 0x5F || // _
                byte === 0x2E || // .
                byte === 0x2A    // *
            ) {
                encoded += String.fromCharCode(byte);
            } else if (byte === 0x20) { // 空格
                encoded += '+';
            } else {
                encoded += '%' + byte.toString(16).toUpperCase().padStart(2, '0');
            }
        }
        return encoded;
    }
});