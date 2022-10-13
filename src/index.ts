import dotenv from 'dotenv';
import * as fs from 'fs';
import PDFDocument from 'pdfkit-table';
import { getAuthData } from './auth';
import { getData } from './formatData';

dotenv.config();
const { APP_PREFIX } = process.env;

type Resource = 'groups' | 'roles' | 'permissions';

const getResource = async (resource: Resource) => {
  try {
    const response = await getAuthData(resource);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Error occurred. response not ok');
    }
  } catch (err) {
    console.info('Error in getResource');
    console.error(err);
  }
};

Promise.all([
  getResource('groups'),
  getResource('roles'),
  getResource('permissions'),
])
  .then(async ([groupData, rolesData, permissionsData]) => {
    const displayData = getData(groupData, rolesData, permissionsData);
    const doc = new PDFDocument();

    const date = new Date();

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const currentDate = `${day}-${month}-${year}`;
    doc.pipe(fs.createWriteStream(`./${APP_PREFIX} ${currentDate}.pdf`));

    const table = {
      title: 'Auth0 data',
      headers: [
        { label: 'Name', property: 'name', width: 125 },
        // { label: 'Description', property: 'description', width: 75 },
        { label: 'Mappings', property: 'mappings', width: 125 },
        { label: 'Roles', property: 'roles', width: 125 },
        // { label: 'Permissions', property: 'permissions', width: 100 },
        { label: 'Members', property: 'members', width: 125 },
      ],
      datas: displayData,
    };
    await doc.table(table);
    doc.end();
  })
  .catch((error) => {
    console.error(error.message);
  });
