type ModuleName = 'LEADS' | 'CONTACTS' | 'ACCOUNTS' | 'OPPORTUNITY' | 'TICKETS' | 'REPORT' | 'FAQ';

function updateItemDetailToList(module: ModuleName, itemDetail, list, index) {
    const resList = [...list];
    const res = resList?.[index] || {};

    switch (module) {
        case 'LEADS':
            res.firstname = itemDetail?.firstname;
            res.lastname = itemDetail?.lastname;
            res.salutation = itemDetail?.salutation;
            res.company = itemDetail?.company;
            res.leadstatus = itemDetail?.leadstatus;
            res.mobile = itemDetail?.mobile;
            res.email = itemDetail?.email;
            res.address = itemDetail?.address;
            res.starred = itemDetail?.starred;
            res.assigned_owners = itemDetail?.assigned_owners;
            res.fullname = itemDetail?.full_name;
            res.createdtime = itemDetail?.createdtime;
            break;
        case 'CONTACTS':
            res.firstname = itemDetail?.firstname;
            res.lastname = itemDetail?.lastname;
            res.salutation = itemDetail?.salutationtype;
            res.accountname = itemDetail?.account_name;
            res.createdtime = itemDetail?.createdtime;
            res.mobile = itemDetail?.mobile;
            res.email = itemDetail?.email;
            res.address = itemDetail?.mailingstreet;
            res.starred = itemDetail?.starred;
            res.assigned_owners = itemDetail?.assigned_owners;
            res.fullname = itemDetail?.full_name;
            break;
    }

    resList[index] = res;

    return resList;
}

function deleteItemDetailToList(list, index) {
    const resList = [...list];
    resList.splice(index, 1);
    return resList;
}

function addItemToList(module: ModuleName, itemDetail, list) {
    let resList = [...list];
    let res = {};
    console.log('New Item: ', JSON.stringify(itemDetail));

    switch (module) {
        case 'LEADS':
            res = {
                id: itemDetail?.id,
                leadid: itemDetail?.id,
                crmid: itemDetail?.id,
                firstname: itemDetail?.firstname,
                lastname: itemDetail?.lastname,
                salutation: itemDetail?.salutation,
                company: itemDetail?.company,
                leadstatus: itemDetail?.leadstatus,
                mobile: itemDetail?.mobile,
                email: itemDetail?.email,
                address: itemDetail?.address,
                starred: itemDetail?.starred,
                assigned_owners: itemDetail?.assigned_owners,
                fullname: itemDetail?.full_name,
                createdtime: itemDetail?.createdtime
            }
            break;
        case 'CONTACTS':
            res = {
                id: itemDetail?.id,
                contactid: itemDetail?.id,
                crmid: itemDetail?.id,
                firstname: itemDetail?.firstname,
                lastname: itemDetail?.lastname,
                salutation: itemDetail?.salutation,
                accountname: itemDetail?.accountname,
                mobile: itemDetail?.mobile,
                email: itemDetail?.email,
                address: itemDetail?.address,
                starred: itemDetail?.starred,
                assigned_owners: itemDetail?.assigned_owners,
                fullname: itemDetail?.full_name,
                createdtime: itemDetail?.createdtime
            }
            break;
    }

    resList.unshift(res);

    return resList;
}

export {
    updateItemDetailToList,
    deleteItemDetailToList,
    addItemToList
}
