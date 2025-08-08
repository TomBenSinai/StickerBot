export class LogService {
  private static logs: string[] = [];

  static init(): void {
    ['log', 'error', 'warn'].forEach((level) => {
      const original = (console as any)[level];
      (console as any)[level] = (...args: any[]) => {
        LogService.logs.push(args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' '));
        original(...args);
      };
    });
  }

  static getLogs(): string[] {
    return LogService.logs;
  }
}
