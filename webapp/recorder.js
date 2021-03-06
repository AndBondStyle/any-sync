import getUserMedia from 'get-user-media-promise';

export default class Recorder {
    constructor(time) {
        this.time = time;
        this.config = {noiseSuppression: false, echoCancellation: false};
        try { getUserMedia({audio: this.config}).then(s => s.getAudioTracks().map(x => x.stop())); }
        catch (err) { console.warn('[REC] INITIAL MIC REQUEST FAILED:', err) }
    }

    async record(start, end) {
        let stream = null;
        try {
            console.debug('[REC] REQUESTING MIC...');
            stream = await getUserMedia({audio: this.config});
        } catch (err) {
            console.warn('[REC] FAILED TO ACQUIRE MIC:', err);
            return null;
        }

        let recorder = new MediaRecorder(stream);
        let resolve = null;
        let promise = new Promise(r => resolve = r);
        recorder.ondataavailable = async e => {
            console.debug('[REC] RECORDING FINISHED');
            let reader = new FileReader();
            let promise = new Promise(r => reader.onloadend = r);
            reader.readAsArrayBuffer(e.data);
            await promise;
            resolve(reader.result);
        };

        setTimeout(() => recorder.start(), (start - this.time()) * 1000);
        setTimeout(() => recorder.stop(), (end - this.time()) * 1000);
        let result = await promise;
        stream.getAudioTracks().map(x => x.stop());
        return result;
    }
}
