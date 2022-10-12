import * as fs from 'fs';
import PDFDocument from 'pdfkit-table';
import { getAuthData } from './auth';
import { getData } from './formatData';

type Resource = 'groups' | 'roles' | 'permissions';

const getResource = async (resource: Resource) => {
  try {
    const response = await getAuthData(resource);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Error occurred');
    }
  } catch (err) {
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
    doc.pipe(fs.createWriteStream('./document.pdf'));

    const table = {
      title: 'Auth0 data',
      headers: [
        { label: 'Name', property: 'name', width: 75 },
        { label: 'Description', property: 'description', width: 75 },
        { label: 'Mappings', property: 'mappings', width: 100 },
        { label: 'Roles', property: 'roles', width: 75 },
        { label: 'Permissions', property: 'permissions', width: 100 },
        { label: 'Members', property: 'members', width: 100 },
      ],
      datas: displayData,
    };
    await doc.table(table);
    doc.end();
  })
  .catch((error) => {
    console.error(error.message);
  });
