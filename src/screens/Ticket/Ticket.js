import Global from '../../Global';
import TicketForm from './TicketForm';
import TicketFormNewVersion from './TicketFormNewVersion';
import TicketFormForPMS from './TicketFormForPMS';
import TicketList from './TicketList';
import TicketView from './TicketView';
import TicketViewNewVersion from './TicketViewNewVersion';
import TicketViewForPMS from './TicketViewForPMS';
// const TicketForm = Global.getServiceUrl('serverUrl').includes('pms.onlinecrm.vn') ? TicketFormForPMS : Global.checkVersionCRMExist('7.1.0.20220325.1200') ? TicketFormNewVersion : TicketFormOld;
// const TicketView = Global.getServiceUrl('serverUrl').includes('pms.onlinecrm.vn') ? TicketViewForPMS : Global.checkVersionCRMExist('7.1.0.20220325.1200') ? TicketViewNewVersion : TicketViewOld;
export {
    TicketForm,
    TicketFormNewVersion,
    TicketFormForPMS,
    TicketList,
    TicketView,
    TicketViewNewVersion,
    TicketViewForPMS
}