import { Command, CommandRunner } from 'nest-commander';

@Command({ name: 'setup-application-data' })
export class SetupApplicationDataCommand extends CommandRunner {
  async run() {
    console.log('Implement command setup data');
  }
}
