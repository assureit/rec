// �e�탂�W���[���̓ǂݍ���
var fs = require('fs');
var sys = require('sys');
var http = require('http');
var url = require('url');
var moment = require('./moment');

var dataObj = {
	jsonrpc:"2.0",
	method:"rawDataSend",
	params: {
		watchID: "sampleID",
		data: {
			name: "ServerA CPU",
			num: 0,
			timestamp: ""
		}
	},
	id: 1
};
dataObj.params.data.timestamp = moment.format();

var apiURL = "http://localhost/rec/api/1.0/";
 
// �Ώۃf�[�^�̓ǂݎ��
readRawData();
 
// �Ώۃf�[�^�̓ǂݎ��֐�
function readRawData() {
    // �ʓr���[�U�[���p�ӂ����A���̊֐��̎��ƂȂ�f�[�^���擾
    // �eURL�ɑ΂��ă��N�G�X�g�𓊂���
    sendRawData(apiURL);
}
 
// raw�f�[�^�̑��M�֐�
function sendRawData(target_url) {
	// URL���p�[�X
	var parsed_url = url.parse(target_url);

	// HTTP���N�G�X�g�p�I�v�V�����̗p��
	var options = {
		hostname: parsed_url.hostname,
		port: 80,
		path: parsed_url.path,
		method: 'POST',
		headers: { 'content-type': "application/json" }
	};

	// HTTP�N���C�A���g�𐶐�
	var req = http.request(options);
	req.on('socket', function(socket) {
		socket.on('connect', function() {
			req.write(dataObj);
			req.end();
		});
	});
    
    // ���X�|���X�C�x���g�n���h��
    req.on('response', function (response) {
        // �f�[�^�擾�����n���h��
        response.on('end', function(){
            // URL�ƃX�e�[�^�X���o��
            console.log(target_url+" - "+response.statusCode);
        })
    });
}
