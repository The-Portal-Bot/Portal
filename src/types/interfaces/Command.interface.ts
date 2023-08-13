import commandConfig from '../../config.command.json';

export function getCommandList() {
  const commandList = [];

  for (let i = 0; i < commandConfig.length; i++) {
    for (let j = 0; j < commandConfig[i].commands.length; j++) {
      commandList.push({
        name: commandConfig[i].commands[j].name,
        hover: commandConfig[i].commands[j].description
      });
    }
  }

  return commandList;
}
