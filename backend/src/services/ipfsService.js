const { create } = require('ipfs-http-client');
const crypto = require('crypto-js');

class IPFSService {
  constructor() {
    // Connect to IPFS node (can be local or remote)
    this.ipfs = create({
      host: process.env.IPFS_HOST || 'localhost',
      port: process.env.IPFS_PORT || 5001,
      protocol: process.env.IPFS_PROTOCOL || 'http'
    });
  }

  /**
   * Upload data to IPFS
   * @param {Object} data - Data to upload
   * @returns {Promise<string>} IPFS hash (CID)
   */
  async uploadToIPFS(data) {
    try {
      const dataString = JSON.stringify(data);
      const result = await this.ipfs.add(dataString);
      return result.path; // Returns the CID
    } catch (error) {
      throw new Error(`Failed to upload to IPFS: ${error.message}`);
    }
  }

  /**
   * Retrieve data from IPFS
   * @param {string} cid - Content Identifier
   * @returns {Promise<Object>} Retrieved data
   */
  async getFromIPFS(cid) {
    try {
      const chunks = [];
      for await (const chunk of this.ipfs.cat(cid)) {
        chunks.push(chunk);
      }
      const data = Buffer.concat(chunks).toString();
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to retrieve from IPFS: ${error.message}`);
    }
  }

  /**
   * Upload file buffer to IPFS
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} filename - File name
   * @returns {Promise<string>} IPFS hash (CID)
   */
  async uploadFile(fileBuffer, filename) {
    try {
      const result = await this.ipfs.add({
        path: filename,
        content: fileBuffer
      });
      return result.path;
    } catch (error) {
      throw new Error(`Failed to upload file to IPFS: ${error.message}`);
    }
  }

  /**
   * Pin content to ensure it stays on the node
   * @param {string} cid - Content Identifier to pin
   * @returns {Promise<void>}
   */
  async pinContent(cid) {
    try {
      await this.ipfs.pin.add(cid);
    } catch (error) {
      throw new Error(`Failed to pin content: ${error.message}`);
    }
  }

  /**
   * Unpin content
   * @param {string} cid - Content Identifier to unpin
   * @returns {Promise<void>}
   */
  async unpinContent(cid) {
    try {
      await this.ipfs.pin.rm(cid);
    } catch (error) {
      throw new Error(`Failed to unpin content: ${error.message}`);
    }
  }

  /**
   * Check if IPFS node is online
   * @returns {Promise<boolean>}
   */
  async isOnline() {
    try {
      await this.ipfs.id();
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new IPFSService();
