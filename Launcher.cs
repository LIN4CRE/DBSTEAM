using System;
using System.Diagnostics;
using System.IO;

namespace DBSTEAM
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            string installedPath = Path.Combine(localAppData, "Programs", "DBSTEAM", "DBSTEAM.exe");
            string devPath = @"D:\Projects\DBSTEAM\release\win-unpacked\DBSTEAM.exe";

            string target = null;
            if (File.Exists(installedPath))
            {
                target = installedPath;
            }
            else if (File.Exists(devPath))
            {
                target = devPath;
            }

            // Pre-launch Instant Cache Sync: If local project dist is newer, sync to AppData web cache
            try
            {
                string devDist = @"D:\Projects\DBSTEAM\dist";
                string webCache = Path.Combine(localAppData, "DBSTEAM", "web");
                if (Directory.Exists(devDist))
                {
                    string devIndex = Path.Combine(devDist, "index.html");
                    string cacheIndex = Path.Combine(webCache, "index.html");
                    if (File.Exists(devIndex))
                    {
                        if (!File.Exists(cacheIndex) || File.GetLastWriteTimeUtc(devIndex) > File.GetLastWriteTimeUtc(cacheIndex))
                        {
                            Directory.CreateDirectory(webCache);
                            Directory.CreateDirectory(Path.Combine(webCache, "assets"));
                            File.Copy(devIndex, cacheIndex, true);
                            string devAssets = Path.Combine(devDist, "assets");
                            if (Directory.Exists(devAssets))
                            {
                                foreach (string file in Directory.GetFiles(devAssets))
                                {
                                    string destFile = Path.Combine(webCache, "assets", Path.GetFileName(file));
                                    File.Copy(file, destFile, true);
                                }
                            }
                        }
                    }
                }
            }
            catch { /* Non-blocking background sync */ }

            if (!string.IsNullOrEmpty(target))
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = target,
                    WorkingDirectory = Path.GetDirectoryName(target),
                    UseShellExecute = true
                };

                Process.Start(psi);
            }
        }
    }
}
