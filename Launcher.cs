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
