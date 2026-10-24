# Team Management
source: https://developer.mastercard.com/platform/documentation/team-management/index.md

## Overview {#overview}

You can invite team members to your Mastercard Developers projects to ensure that all members are notified of project activities and improving the project's visibility within your organization.
You must be an admin to add or remove a team member in the project. Click on the "Team" menu on the left navigation of your project dashboard, and this will direct you to the Team section. At the top of the Team section you will see an "Invite a Team Member" button.

![01-1-team-section-redesign](https://static.developer.mastercard.com/content/platform/img/01-1-team-section-redesign.png)

## Team Member Roles {#team-member-roles}

Roles protect your sensitive information and restrict the actions team members can perform on your project.
There are two roles available in a project: admin and read-only. A project can have a maximum of 10 admin members and a maximum of 20 members in total.

Admin users can:

* Add and remove team members to the project.
* Edit the role of team members (including admin members).
* Request Production access.
* Resubmit production access (where applicable).
* Add and remove Sandbox credentials.
* Add and remove Production credentials.
* Delete the project.

Read-only users can:

* View the project and the keys/credentials information within the project.
* Perform no action except for removing themselves from the project.

## Invite a Team Member to Your Project {#invite-a-team-member-to-your-project}

To invite a team member to your project, complete the following steps:

1. Click the "Team" link in the left navigation.
2. Click the "Invite a Team Member" button at the top of the Team section.
3. Enter the email address of the team member you want to invite, and the role access you want them to have.

![02-team-member-invite-redesign](https://static.developer.mastercard.com/content/platform/img/02-team-member-invite-redesign.png)

4. Click "Invite" in the modal and wait for the dashboard to refresh.
5. Once the user accepts the invitation to the project, their status will change from "Invite Sent" to "Active" and will be able to access the project. Please note that if the invited team member already has an active Mastercard Developers account they will be added to the project automatically.

![02-3-team-member-invited-redesign](https://static.developer.mastercard.com/content/platform/img/02-3-team-member-invited-redesign.png)

## Edit a Team Member's role {#edit-a--team-members-role}

After a team member has accepted their invite, you can edit their role at any from the project's Team section. To edit a team member's role, click the "Edit" button next to their email and confirm the new role change.

![03-2-team-edit-redesign](https://static.developer.mastercard.com/content/platform/img/03-2-team-edit-redesign.png)

## Remove a Team Member from Your Project {#remove-a-team-member-from-your-project}

When a team member is no longer active in a project or within your organization, you can remove them from the project. To remove a team member from the project, complete the following steps:

1. Click the "Team" link in the side navigation.
2. Click the "Remove" button next to the member's email.

![04-1-team-member-remove-redesign](https://static.developer.mastercard.com/content/platform/img/04-1-team-member-remove-redesign.png)

3. Click "Remove" in the confirmation modal and wait for the dashboard to refresh.

![04-2-team-member-removed-redesign](https://static.developer.mastercard.com/content/platform/img/04-2-team-member-removed-redesign.png)

## Leave a Project {#leave-a-project}

To leave from a project, complete the following steps:

1. Click the "Team" link in the side navigation.
2. Click the "Leave Project" button on top of the team members table.

![05-1-team-member-leave-redesign](https://static.developer.mastercard.com/content/platform/img/05-1-team-member-leave-redesign.png)

3. Click "Leave Project" in the confirmation modal and wait for the dashboard to refresh.

![05-2-team-member-leave-redesign](https://static.developer.mastercard.com/content/platform/img/05-2-team-member-leave-redesign.png)

## Transferring Project Ownership {#transferring-project-ownership}

Every project has an "Admin Owner" and by default, the user who created the project is assigned the role of "Admin Owner." Any admin in the project can transfer ownership of the project to another admin, as long as the project has more than 1 active admin user.
Note:   

**Prerequisite:** For projects with Production access, the **new owner must have an active account on Mastercard Developers** and **must be verified under the same Company Id (CID) as the previous owner** . Check out our [company verification documentation](https://developer.mastercard.com/platform/documentation/account-management/company-verification/index.md) for more information.

To transfer ownership of project:

1. Click the "Team" link in the side navigation.
2. Click the "Transfer project ownership" button on top of the team members table.

![06-01-Transfer-button](https://static.developer.mastercard.com/content/platform/img/06-01-Transfer-button.png)

3. Select one of the available admins to transfer ownership to in the drop down field.

![06-03-transfer-user](https://static.developer.mastercard.com/content/platform/img/06-03-transfer-user.png)

4. Click the "Transfer" button in the modal and wait for the dashboard to refresh.

## FAQs {#faqs}

The list of available admins to transfer ownership depends on the project's current state and the prior owner's verification status.

For projects with Production access and where the current owner is verified, only admins verified under the same company as the current owner will be available for ownership transfer. For projects with Sandbox access only or projects where the current owner is unverified, all active admins will be available to transfer ownership.
