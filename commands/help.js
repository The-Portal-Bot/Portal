const cmmd_objct = require('./../assets/properties/command_list');
const vrbl_objct = require('./../assets/properties/variable_list');
const pipe_objct = require('./../assets/properties/pipe_list');
const attr_objct = require('./../assets/properties/attribute_list');
const strc_objct = require('./../assets/properties/structure_list');

module.exports = async (client, message, args, portal_guilds, portal_managed_guilds_path) => {
    if (args.length === 0) {
        message.author.send(cmmd_objct.get_help()).catch(console.error);
        message.author.send(vrbl_objct.get_help()).catch(console.error);
        message.author.send(pipe_objct.get_help()).catch(console.error);
        message.author.send(attr_objct.get_help()).catch(console.error);
        message.author.send(strc_objct.get_help()).catch(console.error);
    } else if (args.length === 1) {
        if (args[0] === 'func') {
            message.author.send(cmmd_objct.get_help()).catch(console.error);
        } else if (args[0] === 'vrbl') {
            message.author.send(vrbl_objct.get_help()).catch(console.error);
        } else if (args[0] === 'pipe') {
            message.author.send(pipe_objct.get_help()).catch(console.error);
        } else if (args[0] === 'attr') {
            message.author.send(attr_objct.get_help()).catch(console.error);
        } else if (args[0] === 'strc') {
            message.author.send(strc_objct.get_help()).catch(console.error);
        } else if (func_detailed = cmmd_objct.get_help_super(args[0])) {
            message.author.send(func_detailed).catch(console.error);
        } else if (vrbl_detailed = vrbl_objct.get_help_super(args[0])) {
            message.author.send(vrbl_detailed).catch(console.error);
        } else if (pipe_detailed = pipe_objct.get_help_super(args[0])) {
            message.author.send(pipe_detailed).catch(console.error);
        } else if (attr_detailed = attr_objct.get_help_super(args[0])) {
            message.author.send(attr_detailed).catch(console.error);
        } else if (strc_detailed = strc_objct.get_help_super(args[0])) {
            message.author.send(strc_detailed).catch(console.error);
        } else {
            return {
                result: false, value: `**${args[0]}**, *does not exist in Portal™,` +
                    `You can run "./help help" for help.*`
            };
        }
    }
    return {
        result: true, value: message.author.username + ', I sent you a private message'
    };
}