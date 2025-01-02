// File keys as a "base-name" for a series of versions of the same file.  Currently it is not used, but will be used to allow access to previous versions if available
export function getFileKey(filename, mediaInfo, version, userData) {
    // Assumes a disguise-style version, with no extra information in the name
    return filename.replace("_v"+version, "")
}

// Version tag is the version number of the file.  It is available as "version" in the rules checker 
export function getVersionTag(filename) {
    // Assumes a disguise-style version, with no extra information in the name
    // if it can't find a version, it returns an empty string
    const nameRE = /^[a-zA-Z0-9_]+?(_[vV]([0-9]+[a-zA-Z]?))?\..+$/;
    const nameMatches = filename.match(nameRE);

    var version = ""

    if (nameMatches) {
        version = nameMatches[2]
    } 

    return version

}

//User data are values that can be checked in the rules checker.  They are available in "dot form", so returning a property "videoFrameRate" here is available
//as "userData.videoFrameRate" in the rules checker

export function getUserData(filename, mediaInfo, version) {
    var cleanName = filename.replace(/^.*[\\\/]/, '')
    const fileBaseName = cleanName.split(".")[0];
    const fileExtension = cleanName.split(".")[1];

    var result = {}
    var videoTracks = []
    var audioTracks = []

    result.extension = fileExtension;

    if (cleanName.includes("_proxy")) {
        result.isProxy = true
    }
    
    //Promote some mediaInfo to userData
    //Note that all mediainfo values are strings.  If you want a number, you need to convert it

    if (mediaInfo) {
        videoTracks = mediaInfo.media.track.filter((track) => track["@type"] == "Video")
        audioTracks = mediaInfo.media.track.filter((track) => track["@type"] == "Audio")

        result.numVideoTracks = videoTracks.length;
        result.numAudioTracks = audioTracks.length;


        if (result.numVideoTracks > 0) {
            var videoTrack = videoTracks[0];
            result.videoFrameRate = videoTrack.FrameRate;
            result.videoFrameRateMode = videoTrack.FrameRate_Mode;
            result.videoCodecID = videoTrack.CodecID;
            result.videoWidth = videoTrack.Width;
            result.videoHeight = videoTrack.Height;

        }

        if (result.numAudioTracks > 0) {
            var audioTrack = audioTracks[0];
            result.audioSamplingRate = audioTrack.SamplingRate;
            result.audioCodecID = audioTrack.CodecID;
            result.audioBitDepth = audioTrack.BitDepth;
            result.audioChannels = audioTrack.Channels;
            result.audioFormat = audioTrack.Format;
            result.audioFormatSettingsEndianness = audioTrack.Format_Settings_Endianness;
            result.audioFormatSettingsSign = audioTrack.Format_Settings_Sign;
        }
    }

    return result;
}

//This lets the Preflight app load these functions by name
export default {getFileKey: getFileKey,
                getVersionTag: getVersionTag,
                getUserData: getUserData
}