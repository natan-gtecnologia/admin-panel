const delay = (milliseconds: number) =>
  new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });

export const download = async (url: string, name: string): Promise<void> => {
  if (!url) return;
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.xlsx`
  a.click();

  await delay(100);
  a.remove();
};