import dotenv from 'dotenv';

dotenv.config();
const { APP_PREFIX } = process.env;

interface Mapping {
  _id: string;
  groupName: string;
  connectionName: string;
}

interface DataInput {
  _id: string;
  applicationType?: string;
  applicationId?: string;
  description: string;
  name: string;
  permissions?: string[];
  roles?: string[];
  members?: string[];
  mappings?: Mapping[];
}

interface AuthData {
  total: number;
  groups?: DataInput[];
  roles?: DataInput[];
  permissions?: DataInput[];
}

interface mapToName {
  [key: string]: string;
}

const mapToName = (data: DataInput[] | undefined): mapToName => {
  if (!data) {
    return {};
  }
  return data.reduce((prev, crt) => {
    return { ...prev, [crt._id]: crt.name };
  }, {});
};

export const getData = (
  groupData: AuthData,
  rolesData: AuthData,
  permissionsData: AuthData
) => {
  const boGroups = groupData.groups
    ?.filter((group) => {
      if (!APP_PREFIX) {
        return false;
      }
      return group.name.includes(APP_PREFIX);
    })
    .sort((g1, g2) => (g1.name > g2.name ? 1 : g2.name > g1.name ? -1 : 0));

  const displayData = boGroups?.map((group) => {
    const rolesToName = mapToName(rolesData?.roles);
    const permissionsToName = mapToName(permissionsData.permissions);
    const {
      name,
      description,
      members: groupMembers,
      roles: groupRoles,
      mappings: groupMappings,
    } = group;
    const mappings = groupMappings?.map((mapping) => mapping.groupName);
    const roles =
      groupRoles
        ?.map((role) => rolesToName[role])
        .filter((notUndefined) => notUndefined) ?? [];
    let permissions;

    if (groupRoles) {
      for (const role of groupRoles) {
        const permissionsToRole = rolesData.roles?.find((r) => {
          return r._id === role;
        });

        permissions = permissionsToRole?.permissions?.map(
          (perm) => permissionsToName[perm]
        );
      }
    }

    const members = groupMembers?.map((member) =>
      member.replace(/google-apps\|/g, '')
    );

    return {
      name,
      description,
      mappings: mappings?.join('\n') ?? '',
      roles: roles.join('\n') ?? '',
      permissions: permissions?.join('\n') ?? '',
      members: members?.join('\n') ?? '',
    };
  });

  return displayData;
};
