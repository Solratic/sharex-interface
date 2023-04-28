export default class Storage {
  key: string;
  data: Record<string, any> | null;

  constructor(key: string) {
    this.key = key;
    this.data = null;
  }

  read(): void {
    const value = localStorage.getItem(this.key);

    if (value === null) return;

    this.data = JSON.parse(value);
  }

  write(): void {
    if (this.data !== null) {
      localStorage.setItem(this.key, JSON.stringify(this.data));
    }
  }
}
