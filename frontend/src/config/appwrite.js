import { Client, ID, Storage, Account } from "appwrite";

const appwriteENV = {
  appwriteUrl: import.meta.env.VITE_APPWRITE_URL || "",
  appwriteProjectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || "",
  appwriteBucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID || "",
};

class AppwriteService {
  constructor() {
    if (!AppwriteService.instance) {
      this.client = new Client()
        .setEndpoint(appwriteENV.appwriteUrl)
        .setProject(appwriteENV.appwriteProjectId);

      this.bucket = new Storage(this.client);
      this.account = new Account(this.client);
      AppwriteService.instance = this;
    }
    return AppwriteService.instance;
  }

  // File Upload Methods
  async uploadFile(file) {
    try {
      const response = await this.bucket.createFile(
        appwriteENV.appwriteBucketId,
        ID.unique(),
        file
      );
      return response; 
    } catch (error) {
      console.log("Appwrite Service :: uploadFile :: error", error);
      return false;
    }
  }

  async deleteFile(fileId) {
    try {
      await this.bucket.deleteFile(appwriteENV.appwriteBucketId, fileId);
      return true;
    } catch (error) {
      console.log("Appwrite Service :: deleteFile :: error", error);
      return false;
    }
  }

  getFileUrl(fileId) {
    return this.bucket.getFileView(appwriteENV.appwriteBucketId, fileId);
  }


}

const appwriteService = new AppwriteService();
export default appwriteService;
