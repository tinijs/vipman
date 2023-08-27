import {readJson, readJsonSync, writeJson} from 'fs-extra';
import {resolve} from 'path';
import {execSync} from 'child_process';
import {green, bold, blueBright} from 'chalk';

interface PackageJson {
  name: string;
  version: string;
  dependencies: {[key: string]: string};
  devDependencies: PackageJson['dependencies'];
  peerDependencies: PackageJson['dependencies'];
}

class BuildService {
  private readonly vipmanPackageJson = readJsonSync(
    resolve('package.json')
  ) as PackageJson;

  constructor(private path: string) {}

  get projectPath() {
    return resolve(this.path);
  }

  get baseVersion() {
    return this.vipmanPackageJson.version;
  }

  async run() {
    // sync version
    const changedDeps = await this.syncVersion();
    console.log(
      `${green('✔')} Synced version to ${bold(blueBright(this.baseVersion))}`
    );
    Object.keys(changedDeps).forEach(key => {
      const names = (changedDeps as any)[key] as string[];
      if (!names.length) return;
      console.log(
        `  + Bump ${key}: ${names.map(name => blueBright(name)).join(', ')}`
      );
    });
    console.log('\n');
    // build
    return this.build();
  }

  private build() {
    const versionText = `v${this.baseVersion}`;
    const buildMessage = `Build ${versionText}`;
    const installCmd = 'npm i';
    const buildCmd = 'npm run build';
    const commitCmd = `git add . && git commit -m "${buildMessage}" && git tag ${versionText} -m "${buildMessage}"`;
    const pushCmd = `git push && git push origin ${versionText}`;
    return execSync(
      `${installCmd} && ${buildCmd} && ${commitCmd} && ${pushCmd}`,
      {cwd: this.projectPath, stdio: 'inherit'}
    );
  }

  private async syncVersion() {
    const packageJsonPath = resolve(this.projectPath, 'package.json');
    const packageJson = (await readJson(packageJsonPath)) as PackageJson;
    // bump version
    packageJson.version = this.baseVersion;
    // sync dependencies
    const changedDeps = {
      dependencies: [] as string[],
      devDependencies: [] as string[],
      peerDependencies: [] as string[],
    };
    if (packageJson.dependencies) {
      const names = this.syncDependenciesVersion(packageJson.dependencies);
      changedDeps.dependencies = names;
    }
    if (packageJson.devDependencies) {
      const names = this.syncDependenciesVersion(packageJson.devDependencies);
      changedDeps.devDependencies = names;
    }
    if (packageJson.peerDependencies) {
      const names = this.syncDependenciesVersion(packageJson.peerDependencies);
      changedDeps.peerDependencies = names;
    }
    // write back
    await writeJson(packageJsonPath, packageJson, {spaces: 2});
    // reports
    return changedDeps;
  }

  private syncDependenciesVersion(deps: PackageJson['dependencies']) {
    const packageNames: string[] = [];
    Object.keys(deps).forEach(key => {
      if (!key.startsWith('@tinijs/') || key.endsWith('-icons')) return;
      deps[key] = `^${this.baseVersion}`;
      packageNames.push(key);
    });
    return packageNames;
  }
}

new BuildService(process.argv[2]).run();
