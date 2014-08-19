
/**
 *
 * tfs.js
 * Created by su9er on 2014/8/13.
 * https://github.com/su9er/tfsjs
 *
 * Copyright (c) 2014 Su9er
 * Licensed under the MIT license.
 *
 */

var fs = require('fs'),
    BufferHelper = require('bufferhelper'),
    iconv = require('iconv-lite'),
    spawn = require('child_process').spawn,
    config = {
        collection: "",
        workspace: "",
        login: "" // /login:username@domain,password
    };
    tfAdress = fs.realpathSync(".\\tf\\tf.cmd"),
    msg = {
        "cmd": {
            "startCommand": "Start cmd command",
            "noCommand": "Missing cmd command",
            "stdout": "Interpreter Output ",
            "stderr": "Interpreter Error: ",
            "exitCode": "Child process exited with code # "
        }
    },
    cmd = function(exe, arg, obj) {
        var ps, outHelper = new BufferHelper(), errHelper = new BufferHelper();
        if (!exe) {
            return msg.cmd.noCommand;
        }
        console.log(exe);
        console.log(arg.join(" "));
        ps = spawn(exe, arg, obj);
        ps.stdout.on('data', function(chunk) {
            //console.log(arg[0] + " file:" + data);
            outHelper.concat(chunk);
        });
        ps.stdout.on('end', function() {
            var outData = iconv.decode(outHelper.toBuffer(),'GBK');
            if (!!outData) {
                console.log("\n<-- " + arg[0] + " -->\n\n" + outData);
            }
        });
        ps.stderr.on('data', function(chunk) {
            //console.log(msg.cmd.stderr + data);
            errHelper.concat(chunk);
        });
        ps.stderr.on('end', function() {
            var errData = iconv.decode(errHelper.toBuffer(),'GBK');
            if (!!errData) {
                console.log("������ʾ��" + errData);
            }
        });
        ps.on('close', function(code, signal) {
            var out = '';
            out += msg.cmd.exitCode + (code || '');
            if (signal != null) {
                out += '\n' + 'Child process terminated due to receipt of signal ' + signal;
            }
        });
    },
    tfCmd = function(paths, command, params) {
        var pathsTest = Object.prototype.toString.call(paths),
            exists,
            arr = [],
            filepaths = "",
            log = command + " files:\n";
        if (pathsTest == '[object String]') {
            paths = paths.indexOf(",") !== -1 ? paths.split(",") : [paths];
        } else if (pathsTest != '[object Array]') {
            throw new TypeError("paths paramter must be a string or an array");
        }
        if (!!params) {
            if (params == '[object String]') {
                params = params.indexOf(",") !== -1 ? params.split(",") : [params];
            } else if (params != '[object Array]') {
                throw new TypeError("params paramter must be a string or an array");
            }
        }
        setTfParams(arr, config);
        arr.concat(params);
        arr.unshift(command);
        for (var i = 0, len = paths.length; i < len; i++) {
            arr.push(fs.realpathSync(paths[i]));
        }
        cmd(tfAdress, arr, {stdio: "pipe"});
        /*paths.forEach(function(filepath, i) {
            filepath = fs.realpathSync(filepath); // resolve full path
            exists = fs.existsSync(filepath);
            if (exists) {
                mixin(arg, arr);
                arg.concat(params);
                arg.unshift(command);
               //arg.push("/comment:the file '" + filepath + "' " + command + " at " + formate(new Date(), "yyyy-mm-dd hh:MM:ss"));
                arg.push(filepath);
                cmd(tfAdress, arg, {stdio: "pipe"});
                log += '\n' + filepath;
            } else {
                throw new ReferenceError('File path is not found: ' + filepath);
            }
        });*/
        log += paths.join("\n");
        console.log(log);
    },
    mixin = function(target, source) {
        var name, src, copy;
        for (name in source) {
            if (source.hasOwnProperty(name)) {
                src = target[name];
                copy = source[name];
                if (src === copy) continue;
                target[name] = copy;
            }
        }
    },
    setTfParams = function(arr, params) {
        var name;
        for(name in params) {
            if (params.hasOwnProperty(name)) {
                arr.push("/" + name + ":" + params[name]);
            }
        }
    },
    formate = function(date,style) {
        var o = {
            "m+" : date.getMonth() + 1, //month
            "d+" : date.getDate(),      //day
            "h+" : date.getHours(),     //hour
            "M+" : date.getMinutes(),   //minute
            "s+" : date.getSeconds(),   //second
            "w+" : "\u65e5\u4e00\u4e8c\u4e09\u56db\u4e94\u516d".charAt(date.getDay()),   //week
            "q+" : Math.floor((date.getMonth() + 3) / 3),  //quarter
            "S"  : date.getMilliseconds() //millisecond
        };
        if (/(y+)/.test(style)) {
            style = style.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for(var k in o){
            if (new RegExp("("+ k +")").test(style)){
                style = style.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return style;
    };



exports.init = function(params) {
    mixin(config, params);
};

exports.add = function(paths, params) {
    return tfCmd(paths, 'add', params);
};

exports.get = function(paths, params) {
    return tfCmd(paths, 'get', params);
};

exports.checkout = function(paths, params) {
    return tfCmd(paths, 'checkout', params);
};


exports.checkin = function(paths, params) {
    return tfCmd(paths, 'checkin', params);
};

exports.delete = function(paths, params) {
    return tfCmd(paths, 'delete', params);
};

exports.undelete = function(paths, params) {
    return tfCmd(paths, 'undelete', params);
};

exports.undo = function(paths, params) {
    return tfCmd(paths, 'undo', params);
};

exports.rollback = function(paths, params) {
    return tfCmd(paths, 'rollback', params);
};

exports.history = function(paths, params) {
    return tfCmd(paths, 'history', params);
};

exports.workflod = function(paths, params) {
    return tfCmd(paths, 'worflod', params);
};
