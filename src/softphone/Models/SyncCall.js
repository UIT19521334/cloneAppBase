class SyncCall {
    // Thong tin cuoc goi
    serial;
    callId;
    callkitId;
    callCode;
    isVideoCall;
    isShowCallLog;
    rejected; // nguoi dung da click reject cuoc goi
    answered; // nguoi dung da click answer cuoc goi

    endedCallkit; // da end Callkit Call cho cuoc goi nay
    endedStringeeCall; // da end Stringee Call cho cuoc goi nay
    isAnswerFromUI; // thuc hien nhan answer tren UI khong phai la callKit
    receivedStringeeCall;
    calling;
    customerData;
    customerId;
    customerName;
    phoneNumber;
    companyName;
    record_module;
    startTime;
    endTime;
    avatar;
    direction;
    callLogData;
    metadata;
    canCreateNewCustomer;

    constructor() {
        this.serial = 1;
        this.callId = '';
        this.callkitId = '';
        this.callCode = 0;
        this.isShowCallLog = false;
        this.rejected = false;
        this.answered = false;
        this.endedCallkit = false;
        this.endedStringeeCall = false;
        this.receivedStringeeCall = false;
        this.isAnswerFromUI = false;
        this.calling = false;
        this.customerData = {};
        this.customerId = '';
        this.customerName = '';
        this.companyName = '';
        this.record_module = '';
        this.phoneNumber = '';
        this.startTime = '';
        this.endTime = '';
        this.avatar = '';
        this.direction = '';
        this.callLogData = {};
        this.metadata = {};
        this.canCreateNewCustomer = true;
    }

    // Da show callkit cho cuoc goi nay chua
    showedCallkit() {
        return this.callkitId != '';
    }

    // Cuoc goi CallkitCall dang duoc show voi uuid nay hay khong
    showedFor(uuid) {
        return this.callkitId == uuid;
    }

    // Check xem cuoc goi voi cac thong tin nay co phai chinh la minh khong
    isThisCall(callId, serial) {
        return this.callId == callId && this.serial == serial;
    }

    // Cuoc goi da duoc end ca callkit va stringecall => co the giai phong instance
    isEnded() {
        return this.endedCallkit && this.endedStringeeCall;
    }
}

export default SyncCall;