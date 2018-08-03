// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Experiments       - github.com/muaz-khan/WebRTC-Experiment

var settingsPanel = getElement('.settings-panel');




var audioDeviecs = getElement('#audio-devices');
var videoDeviecs = getElement('#video-devices');

rtcMultiConnection.getDevices(function(devices) {
    for (var device in devices) {
        device = devices[device];
        appendDevice(device);
    }
});

function appendDevice(device) {
    var option = document.createElement('option');
    option.value = device.id;
    option.innerHTML = device.label || device.id;
    if (device.kind == 'audio') {
        audioDeviecs.appendChild(option);
    } else videoDeviecs.appendChild(option);
}
